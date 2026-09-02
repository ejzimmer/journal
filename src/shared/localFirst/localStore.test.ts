import "fake-indexeddb/auto"
import { createLocalStore } from "./localStore"

function uniqueDbName() {
  return `local-store-test-${Math.random()}`
}

describe("createLocalStore", () => {
  it("reads undefined before hydration and for missing paths after", async () => {
    const store = createLocalStore(uniqueDbName())
    await store.hydrate()
    expect(store.readPath("missing")).toBeUndefined()
  })

  it("writes are readable immediately, without waiting on persistence", async () => {
    const store = createLocalStore(uniqueDbName())
    await store.hydrate()

    store.writePath("work/list1", { id: "list1", description: "Chores" })

    expect(store.readPath("work/list1")).toEqual({
      id: "list1",
      description: "Chores",
    })
  })

  it("notifies subscribers of a related path on write", async () => {
    const store = createLocalStore(uniqueDbName())
    await store.hydrate()
    const onChange = jest.fn()
    store.subscribe("work", onChange)

    store.writePath("work/list1", { id: "list1" })

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it("doesn't notify subscribers of an unrelated path", async () => {
    const store = createLocalStore(uniqueDbName())
    await store.hydrate()
    const onChange = jest.fn()
    store.subscribe("labels", onChange)

    store.writePath("work/list1", { id: "list1" })

    expect(onChange).not.toHaveBeenCalled()
  })

  it("stops notifying after unsubscribing", async () => {
    const store = createLocalStore(uniqueDbName())
    await store.hydrate()
    const onChange = jest.fn()
    const unsubscribe = store.subscribe("work", onChange)
    unsubscribe()

    store.writePath("work/list1", { id: "list1" })

    expect(onChange).not.toHaveBeenCalled()
  })

  it("persists writes to disk and a fresh instance rehydrates them", async () => {
    const dbName = uniqueDbName()
    const store1 = createLocalStore(dbName)
    await store1.hydrate()
    store1.writePath("work/list1", { id: "list1", description: "Chores" })

    // writePath persists asynchronously (fire-and-forget); give it a tick.
    await new Promise((resolve) => setTimeout(resolve, 0))

    const store2 = createLocalStore(dbName)
    await store2.hydrate()
    expect(store2.readPath("work/list1")).toEqual({
      id: "list1",
      description: "Chores",
    })
  })
})
