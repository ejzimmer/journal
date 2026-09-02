import "fake-indexeddb/auto"
import { createOutbox, Outbox } from "./outbox"
import { createSyncEngine } from "./syncEngine"

const mockSet = jest.fn().mockResolvedValue(undefined)
const mockRemove = jest.fn().mockResolvedValue(undefined)

jest.mock("firebase/database", () => ({
  ref: (_database: unknown, path: string) => ({ path }),
  set: (reference: { path: string }, value: unknown) =>
    mockSet(reference.path, value),
  remove: (reference: { path: string }) => mockRemove(reference.path),
}))

function uniqueDbName() {
  return `sync-engine-test-${Math.random()}`
}

function fakeDatabase() {
  return {} as import("firebase/database").Database
}

// IndexedDB (even the fake one) resolves across several real event-loop
// turns - opening a connection, then a transaction, then a request - so a
// single setTimeout(0) isn't always enough to observe a drain settle.
async function flushMicrotasks() {
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

describe("createSyncEngine", () => {
  let outbox: Outbox

  beforeEach(() => {
    outbox = createOutbox(uniqueDbName())
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    })
  })

  it("drains a write op against the real database and removes it from the outbox", async () => {
    await outbox.enqueue({ path: "work/list1", value: { id: "list1" } })
    const engine = createSyncEngine(fakeDatabase(), outbox)

    engine.start()
    await flushMicrotasks()

    expect(mockSet).toHaveBeenCalledWith("work/list1", { id: "list1" })
    expect(await outbox.list()).toEqual([])
  })

  it("calls remove (not set) for a delete op", async () => {
    await outbox.enqueue({ path: "work/list1", value: null })
    const engine = createSyncEngine(fakeDatabase(), outbox)

    engine.start()
    await flushMicrotasks()

    expect(mockRemove).toHaveBeenCalledWith("work/list1")
    expect(mockSet).not.toHaveBeenCalled()
  })

  it("drains multiple ops in order", async () => {
    await outbox.enqueue({ path: "a", value: 1 })
    await outbox.enqueue({ path: "b", value: 2 })
    const engine = createSyncEngine(fakeDatabase(), outbox)

    engine.start()
    await flushMicrotasks()

    expect(mockSet.mock.calls.map((call) => call[0])).toEqual(["a", "b"])
  })

  it("stops draining after a failure and leaves the op in the outbox", async () => {
    mockSet.mockRejectedValueOnce(new Error("offline"))
    await outbox.enqueue({ path: "a", value: 1 })
    await outbox.enqueue({ path: "b", value: 2 })
    const engine = createSyncEngine(fakeDatabase(), outbox)

    engine.start()
    await flushMicrotasks()

    expect(mockSet).toHaveBeenCalledTimes(1)
    expect((await outbox.list()).map((op) => op.path)).toEqual(["a", "b"])
  })

  it("doesn't attempt to drain while offline", async () => {
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    })
    await outbox.enqueue({ path: "a", value: 1 })
    const engine = createSyncEngine(fakeDatabase(), outbox)

    engine.start()
    await flushMicrotasks()

    expect(mockSet).not.toHaveBeenCalled()
  })

  it("retries a failed op once notified again", async () => {
    mockSet.mockRejectedValueOnce(new Error("offline"))
    await outbox.enqueue({ path: "a", value: 1 })
    const engine = createSyncEngine(fakeDatabase(), outbox)

    engine.start()
    await flushMicrotasks()
    expect(mockSet).toHaveBeenCalledTimes(1)

    engine.notifyChange()
    await flushMicrotasks()

    expect(mockSet).toHaveBeenCalledTimes(2)
    expect(await outbox.list()).toEqual([])
  })
})
