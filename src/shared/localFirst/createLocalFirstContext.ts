import { Database, onValue, ref } from 'firebase/database';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { ContextType } from '../FirebaseContext';
import { createLocalStore } from './localStore';
import { createOutbox, StoredOutboxOp } from './outbox';
import {
  getAtPath,
  pathsAreRelated,
  setAtPath,
  Tree,
  valuesAreEqual,
} from './pathTree';
import { createSyncEngine } from './syncEngine';
import {
  convertReadValueToV1,
  convertUpdatesToV2,
  findV2ReadPath,
} from './v2Shape';

export type ReadSource = 'v1' | 'v2';

export function createLocalFirstContext(
  database: Database,
  dbName = 'journal-local-first',
  readSource: ReadSource = 'v1',
): { context: ContextType; hydrate: () => Promise<void> } {
  const localStore = createLocalStore(`${dbName}-local`);
  const outbox = createOutbox(`${dbName}-outbox`);
  const syncEngine = createSyncEngine(database, outbox);
  syncEngine.startSyncing();

  const keysWithRemoteListener = new Set<string>();
  const syncedKeys = new Set<string>();
  const syncListeners = new Set<() => void>();

  function isSynced(key: string) {
    return [...syncedKeys].some(
      (syncedKey) => key === syncedKey || key.startsWith(`${syncedKey}/`),
    );
  }

  function markSynced(key: string) {
    syncedKeys.add(key);
    syncListeners.forEach((onChange) => onChange());
  }

  function subscribeToSync(onChange: () => void) {
    syncListeners.add(onChange);
    return () => syncListeners.delete(onChange);
  }

  function registerRemoteListener(key: string) {
    if (keysWithRemoteListener.has(key)) {
      return;
    }
    keysWithRemoteListener.add(key);

    onValue(ref(database, key), async (snapshot) => {
      const pendingOps = await outbox.list();
      localStore.writePath(
        key,
        applyPendingOps(key, snapshot.val(), pendingOps),
      );
      markSynced(key);
    });
  }

  function write(updates: Record<string, unknown>) {
    const changes = Object.entries(updates).filter(
      ([path, value]) =>
        value === null ||
        value === undefined ||
        !valuesAreEqual(localStore.readPath(path), value),
    );
    if (changes.length === 0) {
      return;
    }

    changes.forEach(([path, value]) => localStore.writePath(path, value));
    const v2Updates = convertUpdatesToV2(
      Object.fromEntries(changes),
      localStore.readPath,
    );
    Object.entries(v2Updates).forEach(([path, value]) =>
      localStore.writePath(path, value),
    );
    void outbox
      .enqueue({ updates: { ...Object.fromEntries(changes), ...v2Updates } })
      .then(() => syncEngine.notifyChange());
  }

  const context: ContextType = {
    addItem: (parent, item) => {
      const id = crypto.randomUUID();
      write({ [`${parent}/${id}`]: { ...item, id } });
      return id;
    },
    updateItem: (parent, item) => {
      const path = item.id ? `${parent}/${item.id}` : parent;
      write({ [path]: item });
    },
    deleteItem: (parent, item) => {
      if (!item.id) {
        console.error(
          `deleteItem called with no id, refusing to delete under "${parent}"`,
          item,
        );
        return;
      }
      write({ [`${parent}/${item.id}`]: null });
    },
    updateList: (listName, list) => {
      const map = list.reduce(
        (items, item) => {
          items[item.id] = item;
          return items;
        },
        {} as Record<string, unknown>,
      );
      write({ [listName]: map });
    },
    setValue: (path, value) => {
      write({ [path]: value });
    },
    setValues: write,
    moveItemBetweenLists: ({
      movedItem,
      sourceListId,
      targetListId,
      targetListItems = [],
    }) => {
      const updates: Record<string, unknown> = {
        [`${targetListId}/${movedItem.id}`]: movedItem,
        [`${sourceListId}/${movedItem.id}`]: null,
      };
      targetListItems.forEach((existingItem) => {
        updates[`${targetListId}/${existingItem.id}/position`] =
          existingItem.position < movedItem.position
            ? existingItem.position
            : existingItem.position + 1;
      });
      write(updates);
    },
    useValue: <T>(key?: string) => {
      const sourceKey = key && readSource === 'v2' ? findV2ReadPath(key) : key;

      useEffect(() => {
        if (sourceKey) registerRemoteListener(sourceKey);
      }, [sourceKey]);

      const sourceValue = useSyncExternalStore(
        (onChange) =>
          sourceKey ? localStore.subscribe(sourceKey, onChange) : () => {},
        () => (sourceKey ? localStore.readPath(sourceKey) : undefined),
      );
      const value = useMemo(
        () =>
          key && readSource === 'v2'
            ? convertReadValueToV1(key, sourceValue)
            : sourceValue,
        [key, sourceValue],
      ) as T | undefined;
      const synced = useSyncExternalStore(subscribeToSync, () =>
        sourceKey ? isSynced(sourceKey) : false,
      );

      return { value, loading: false, synced };
    },
  };

  return { context, hydrate: localStore.hydrate };
}

function applyPendingOps(
  key: string,
  remoteValue: unknown,
  pendingOps: StoredOutboxOp[],
): unknown {
  const tree = pendingOps
    .flatMap((op) => Object.entries(op.updates))
    .filter(([path]) => pathsAreRelated(path, key))
    .reduce<Tree>(
      (tree, [path, value]) => setAtPath(tree, path, value),
      setAtPath({}, key, remoteValue),
    );

  return getAtPath(tree, key);
}
