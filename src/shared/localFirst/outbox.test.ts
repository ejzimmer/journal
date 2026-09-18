import "fake-indexeddb/auto"
import { createOutbox, outboxTouchesPath, StoredOutboxOp } from "./outbox"

function uniqueDbName() {
  return `outbox-test-${Math.random()}`
}

function pathOf(op: StoredOutboxOp): string | undefined {
  return "path" in op ? op.path : undefined
}

describe("createOutbox", () => {
  it("lists enqueued ops in FIFO order", async () => {
    const outbox = createOutbox(uniqueDbName())

    await outbox.enqueue({ path: "a", value: 1 })
    await outbox.enqueue({ path: "b", value: 2 })
    await outbox.enqueue({ path: "c", value: 3 })

    const ops = await outbox.list()
    expect(ops.map(pathOf)).toEqual(["a", "b", "c"])
  })

  it("removes an op by id", async () => {
    const outbox = createOutbox(uniqueDbName())
    await outbox.enqueue({ path: "a", value: 1 })
    await outbox.enqueue({ path: "b", value: 2 })

    const [first] = await outbox.list()
    await outbox.remove(first.id)

    const remaining = await outbox.list()
    expect(remaining.map(pathOf)).toEqual(["b"])
  })

  it("persists across separate outbox instances for the same db name", async () => {
    const dbName = uniqueDbName()
    const outbox1 = createOutbox(dbName)
    await outbox1.enqueue({ path: "a", value: 1 })

    const outbox2 = createOutbox(dbName)
    const ops = await outbox2.list()
    expect(ops.map(pathOf)).toEqual(["a"])
  })
})

describe("outboxTouchesPath", () => {
  it("is true for an exact match", () => {
    const ops = [{ id: 1, path: "work/list1", value: {} }]
    expect(outboxTouchesPath(ops, "work/list1")).toBe(true)
  })

  it("is true when the pending op is nested under the queried path", () => {
    const ops = [{ id: 1, path: "work/list1/items/task1", value: {} }]
    expect(outboxTouchesPath(ops, "work")).toBe(true)
  })

  it("is false when nothing pending touches the path", () => {
    const ops = [{ id: 1, path: "work/list1", value: {} }]
    expect(outboxTouchesPath(ops, "labels")).toBe(false)
  })

  it("is true when a multi-write op's updates include the path", () => {
    const ops = [
      {
        id: 1,
        updates: { "work/list1/task1": {}, "work/list2/task1": null },
      },
    ]
    expect(outboxTouchesPath(ops, "work/list2/task1")).toBe(true)
  })

  it("is false when a multi-write op's updates don't include the path", () => {
    const ops = [{ id: 1, updates: { "work/list1/task1": {} } }]
    expect(outboxTouchesPath(ops, "labels")).toBe(false)
  })
})

describe("createOutbox multi-write ops", () => {
  it("enqueues and lists an atomic multi-path update", async () => {
    const outbox = createOutbox(uniqueDbName())
    const updates = { "work/list1/task1": null, "work/list2/task1": {} }

    await outbox.enqueue({ updates })

    const [op] = await outbox.list()
    expect(op).toEqual({ id: 1, updates })
  })
})
