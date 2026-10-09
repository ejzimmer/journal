import { Database, get, onValue, ref } from 'firebase/database';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { ContextType } from '../FirebaseContext';
import { createConflictStore } from './conflictStore';
import {
  Conflict,
  createEditTimeUpdates,
  separateConflicts,
} from './editTimes';
import { createLocalStore } from './localStore';
import { createOutbox, StoredOutboxOp } from './outbox';
import {
  getAtPath,
  findChangedFields,
  pathsAreRelated,
  setAtPath,
  Tree,
} from './pathTree';
import { createSyncEngine } from './syncEngine';
import {
  APP_DATA_VERSION,
  convertReadValueToV1,
  convertUpdatesToV2,
  findV2ReadPath,
  MINIMUM_APP_VERSION_PATH,
  V2_ROOT,
} from './v2Shape';

export type SaveState = 'saving' | 'failing' | 'outdated';

export type SaveStatus = {
  subscribe: (onChange: () => void) => () => void;
  getSaveState: () => SaveState;
};

export type ConflictStatus = {
  subscribe: (onChange: () => void) => () => void;
  listConflicts: () => Conflict[];
  keepMine: (path: string) => void;
  keepTheirs: (path: string) => void;
};

export function createLocalFirstContext(
  database: Database,
  dbName = 'journal-local-first',
): {
  context: ContextType;
  hydrate: () => Promise<void>;
  saveStatus: SaveStatus;
  conflictStatus: ConflictStatus;
} {
  const localStore = createLocalStore(`${dbName}-local`);
  const outbox = createOutbox(`${dbName}-outbox`);
  const conflictStore = createConflictStore(`${dbName}-conflicts`);
  const saveStatusListeners = new Set<() => void>();
  let isOutdated = false;
  let isFailing = false;
  const notifySaveStatus = () =>
    saveStatusListeners.forEach((onChange) => onChange());
  const syncEngine = createSyncEngine(
    database,
    outbox,
    () => !isOutdated,
    (succeeded) => {
      if (isFailing === !succeeded) return;
      isFailing = !succeeded;
      notifySaveStatus();
    },
    prepareUpdates,
  );
  void outbox.keepOnlyPathsUnder(V2_ROOT).then(() => syncEngine.startSyncing());

  onValue(ref(database, MINIMUM_APP_VERSION_PATH), (snapshot) => {
    isOutdated = Number(snapshot.val() ?? 0) > APP_DATA_VERSION;
    notifySaveStatus();
    syncEngine.notifyChange();
  });

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

  async function readServerPath(path: string) {
    return (await get(ref(database, path))).val();
  }

  async function prepareUpdates(op: StoredOutboxOp) {
    if (op.editedAt === undefined) return op.updates;

    const { kept, conflicts } = await separateConflicts(
      op.updates,
      op.editedAt,
      readServerPath,
      (path) => op.itemCopies?.[path] ?? localStore.readPath(path),
    );
    if (conflicts.length > 0) {
      conflicts.forEach(({ path, theirs }) =>
        localStore.writePath(path, theirs),
      );
      await conflictStore.add(
        conflicts.map((conflict) => ({
          ...conflict,
          item: findItemCopy(op.itemCopies ?? {}, conflict.path),
        })),
      );
    }
    return { ...kept, ...createEditTimeUpdates(kept, op.editedAt) };
  }

  function commit(changes: [string, unknown][]) {
    changes.forEach(([path, value]) => localStore.writePath(path, value));
    void outbox
      .enqueue({
        updates: Object.fromEntries(changes),
        editedAt: Date.now(),
        itemCopies: findItemCopies(changes.map(([path]) => path)),
      })
      .then(() => syncEngine.notifyChange());
  }

  function findItemCopies(paths: string[]): Record<string, unknown> {
    return Object.fromEntries(
      paths.flatMap((path) => {
        const itemPath = findItemPath(path);
        return itemPath ? [[itemPath, localStore.readPath(itemPath)]] : [];
      }),
    );
  }

  function findItemCopy(itemCopies: Record<string, unknown>, path: string) {
    return Object.entries(itemCopies).find(
      ([itemPath]) => path === itemPath || path.startsWith(`${itemPath}/`),
    )?.[1];
  }

  function findItemPath(path: string): string | undefined {
    const segments = path.split('/');
    return segments
      .map((_, index) => segments.slice(0, segments.length - index).join('/'))
      .find((candidate) => {
        const value = localStore.readPath<Tree>(candidate);
        return (
          typeof value === 'object' &&
          value !== null &&
          value.id === candidate.split('/').pop()
        );
      });
  }

  function readV1Path(path: string) {
    return convertReadValueToV1(
      path,
      localStore.readPath(findV2ReadPath(path)),
    );
  }

  function write(updates: Record<string, unknown>) {
    const v2Updates = convertUpdatesToV2(updates, (unitPath) =>
      readV1PathWithUpdates(unitPath, readV1Path(unitPath), updates),
    );
    const changes = Object.entries(v2Updates).flatMap(([path, value]) =>
      value === null
        ? [[path, null] as [string, unknown]]
        : findChangedFields(path, localStore.readPath(path), value),
    );
    if (changes.length > 0) {
      commit(changes);
    }
  }

  function findConflict(path: string) {
    return conflictStore.list().find((conflict) => conflict.path === path);
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
      const sourceKey = key && findV2ReadPath(key);

      useEffect(() => {
        if (sourceKey) registerRemoteListener(sourceKey);
      }, [sourceKey]);

      const sourceValue = useSyncExternalStore(
        (onChange) =>
          sourceKey ? localStore.subscribe(sourceKey, onChange) : () => {},
        () => (sourceKey ? localStore.readPath(sourceKey) : undefined),
      );
      const value = useMemo(
        () => (key ? convertReadValueToV1(key, sourceValue) : undefined),
        [key, sourceValue],
      ) as T | undefined;
      const synced = useSyncExternalStore(subscribeToSync, () =>
        sourceKey ? isSynced(sourceKey) : false,
      );

      return { value, loading: false, synced };
    },
  };

  return {
    context,
    hydrate: async () => {
      await Promise.all([localStore.hydrate(), conflictStore.hydrate()]);
    },
    conflictStatus: {
      subscribe: conflictStore.subscribe,
      listConflicts: conflictStore.list,
      keepMine: (path) => {
        const conflict = findConflict(path);
        if (!conflict) return;
        commit([[path, conflict.mine ?? null]]);
        void conflictStore.remove(path);
      },
      keepTheirs: (path) => {
        const conflict = findConflict(path);
        if (!conflict) return;
        localStore.writePath(path, conflict.theirs);
        void conflictStore.remove(path);
      },
    },
    saveStatus: {
      subscribe: (onChange) => {
        saveStatusListeners.add(onChange);
        return () => saveStatusListeners.delete(onChange);
      },
      getSaveState: () =>
        isOutdated ? 'outdated' : isFailing ? 'failing' : 'saving',
    },
  };
}

function readV1PathWithUpdates(
  unitPath: string,
  currentValue: unknown,
  updates: Record<string, unknown>,
): unknown {
  const tree = Object.entries(updates)
    .filter(([path]) => pathsAreRelated(path, unitPath))
    .reduce<Tree>(
      (tree, [path, value]) => setAtPath(tree, path, value),
      setAtPath({}, unitPath, currentValue),
    );

  return getAtPath(tree, unitPath);
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
