import { createStore, del, entries, keys, set } from 'idb-keyval';
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
    async enqueue(op) {
      const existingIds = (await keys(store)) as number[];
      const nextId =
        existingIds.length === 0 ? 1 : Math.max(...existingIds) + 1;
      await set(nextId, op, store);
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
