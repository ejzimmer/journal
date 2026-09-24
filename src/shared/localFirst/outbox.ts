import { createStore, del, entries, promisifyRequest } from 'idb-keyval';
import { pathsAreRelated } from './pathTree';

export type OutboxOp = { updates: Record<string, unknown> };

export type StoredOutboxOp = OutboxOp & { id: number };

export type Outbox = {
  enqueue: (op: OutboxOp) => Promise<void>;
  list: () => Promise<StoredOutboxOp[]>;
  peekFront: () => Promise<StoredOutboxOp | undefined>;
  remove: (id: number) => Promise<void>;
};

export function createOutbox(dbName: string): Outbox {
  const store = createStore(dbName, 'outbox');

  async function list() {
    const all = (await entries(store)) as [number, OutboxOp][];
    return all.sort(([a], [b]) => a - b).map(([id, op]) => ({ id, ...op }));
  }

  return {
    enqueue(op) {
      return store('readwrite', (objectStore) => {
        const lastEntry = objectStore.openCursor(null, 'prev');
        lastEntry.onsuccess = () => {
          const lastId = (lastEntry.result?.key as number | undefined) ?? 0;
          objectStore.put(op, lastId + 1);
        };
        return promisifyRequest(objectStore.transaction);
      });
    },
    list,
    async peekFront() {
      const [front] = await list();
      return front;
    },
    async remove(id) {
      await del(id, store);
    },
  };
}

export function opsTouchPath(ops: StoredOutboxOp[], path: string): boolean {
  return ops.some((op) =>
    Object.keys(op.updates).some((updatePath) =>
      pathsAreRelated(updatePath, path),
    ),
  );
}
