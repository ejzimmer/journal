import "fake-indexeddb/auto"
import { createOutbox, outboxTouchesPath } from "./outbox"

function uniqueDbName() {
  return `outbox-test-${Math.random()}`
}

describe("createOutbox", () => {
  it("lists enqueued ops in FIFO order", async () => {
    const outbox = createOutbox(uniqueDbName())

    await outbox.enqueue({ path: "a", value: 1 })
    await outbox.enqueue({ path: "b", value: 2 })
    await outbox.enqueue({ path: "c", value: 3 })

    const ops = await outbox.list()
    expect(ops.map((op) => op.path)).toEqual(["a", "b", "c"])
  })

  it("removes an op by id", async () => {
    const outbox = createOutbox(uniqueDbName())
    await outbox.enqueue({ path: "a", value: 1 })
    await outbox.enqueue({ path: "b", value: 2 })

    const [first] = await outbox.list()
    await outbox.remove(first.id)

    const remaining = await outbox.list()
    expect(remaining.map((op) => op.path)).toEqual(["b"])
  })

  it("persists across separate outbox instances for the same db name", async () => {
    const dbName = uniqueDbName()
    const outbox1 = createOutbox(dbName)
    await outbox1.enqueue({ path: "a", value: 1 })

    const outbox2 = createOutbox(dbName)
    const ops = await outbox2.list()
    expect(ops.map((op) => op.path)).toEqual(["a"])
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
})
