import { createStore, del, entries, keys, set } from "idb-keyval"
import { pathsAreRelated } from "./pathTree"

export type OutboxOp = {
  path: string
  // undefined/null means "delete this path", matching Firebase Realtime
  // Database's own semantics for a null write.
  value: unknown
}

export type StoredOutboxOp = OutboxOp & { id: number }

export type Outbox = {
  enqueue: (op: OutboxOp) => Promise<void>
  list: () => Promise<StoredOutboxOp[]>
  remove: (id: number) => Promise<void>
}

export function createOutbox(dbName: string): Outbox {
  const store = createStore(dbName, "outbox")

  return {
    async enqueue(op) {
      const existingIds = (await keys(store)) as number[]
      const nextId =
        existingIds.length === 0 ? 1 : Math.max(...existingIds) + 1
      await set(nextId, op, store)
    },
    async list() {
      const all = (await entries(store)) as [number, OutboxOp][]
      return all
        .sort(([a], [b]) => a - b)
        .map(([id, op]) => ({ id, ...op }))
    },
    async remove(id) {
      await del(id, store)
    },
  }
}

export function outboxTouchesPath(
  ops: StoredOutboxOp[],
  path: string,
): boolean {
  return ops.some((op) => pathsAreRelated(op.path, path))
}
