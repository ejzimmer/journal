import "fake-indexeddb/auto"
import { createOutbox, Outbox } from "./outbox"
import { createSyncEngine } from "./syncEngine"

const mockUpdate = jest.fn().mockResolvedValue(undefined)

jest.mock("firebase/database", () => ({
  ref: (_database: unknown, path?: string) => ({ path }),
  update: (_reference: unknown, updates: Record<string, unknown>) =>
    mockUpdate(updates),
}))

function uniqueDbName() {
  return `sync-engine-test-${Math.random()}`
}

function fakeDatabase() {
  return {} as import("firebase/database").Database
}

// fake-indexeddb (idb-keyval's IndexedDB backend in tests) grabs Node's real
// setImmediate to schedule its callbacks, bypassing Jest's fake timers - so
// we wait for it the old-fashioned way, with real timers.
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
    await outbox.enqueue({ updates: { "work/list1": { id: "list1" } } })
    const engine = createSyncEngine(fakeDatabase(), outbox)

    engine.startSyncing()
    await flushMicrotasks()

    expect(mockUpdate).toHaveBeenCalledWith({ "work/list1": { id: "list1" } })
    expect(await outbox.list()).toEqual([])
  })

  it("drains multiple ops in order", async () => {
    await outbox.enqueue({ updates: { a: 1 } })
    await outbox.enqueue({ updates: { b: 2 } })
    const engine = createSyncEngine(fakeDatabase(), outbox)

    engine.startSyncing()
    await flushMicrotasks()

    expect(mockUpdate.mock.calls.map((call) => call[0])).toEqual([
      { a: 1 },
      { b: 2 },
    ])
  })

  it("stops draining after a failure and leaves the op in the outbox", async () => {
    mockUpdate.mockRejectedValueOnce(new Error("offline"))
    await outbox.enqueue({ updates: { a: 1 } })
    await outbox.enqueue({ updates: { b: 2 } })
    const engine = createSyncEngine(fakeDatabase(), outbox)

    engine.startSyncing()
    await flushMicrotasks()

    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect((await outbox.list()).map((op) => op.updates)).toEqual([
      { a: 1 },
      { b: 2 },
    ])
  })

  it("drains a multi-write op as a single atomic update", async () => {
    const updates = { "work/list1/task1": null, "work/list2/task1": {} }
    await outbox.enqueue({ updates })
    const engine = createSyncEngine(fakeDatabase(), outbox)

    engine.startSyncing()
    await flushMicrotasks()

    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(mockUpdate).toHaveBeenCalledWith(updates)
    expect(await outbox.list()).toEqual([])
  })

  it("doesn't attempt to drain while offline", async () => {
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    })
    await outbox.enqueue({ updates: { a: 1 } })
    const engine = createSyncEngine(fakeDatabase(), outbox)

    engine.startSyncing()
    await flushMicrotasks()

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("only registers one online listener even if startSyncing is called twice", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener")
    const engine = createSyncEngine(fakeDatabase(), outbox)

    engine.startSyncing()
    engine.startSyncing()

    const onlineListenerCalls = addEventListenerSpy.mock.calls.filter(
      ([eventName]) => eventName === "online",
    )
    expect(onlineListenerCalls).toHaveLength(1)

    addEventListenerSpy.mockRestore()
  })

  it("retries a failed op once notified again", async () => {
    mockUpdate.mockRejectedValueOnce(new Error("offline"))
    await outbox.enqueue({ updates: { a: 1 } })
    const engine = createSyncEngine(fakeDatabase(), outbox)

    engine.startSyncing()
    await flushMicrotasks()
    expect(mockUpdate).toHaveBeenCalledTimes(1)

    engine.notifyChange()
    await flushMicrotasks()

    expect(mockUpdate).toHaveBeenCalledTimes(2)
    expect(await outbox.list()).toEqual([])
  })
})
