import "fake-indexeddb/auto"
import { renderHook, waitFor } from "@testing-library/react"
import { createLocalFirstContext } from "./createLocalFirstContext"

const mockUpdate = jest.fn().mockResolvedValue(undefined)
const mockOnValueCallbacks = new Map<string, (snapshot: { val: () => unknown }) => void>()

jest.mock("firebase/database", () => ({
  ref: (_database: unknown, path?: string) => ({ path }),
  update: (_reference: unknown, updates: Record<string, unknown>) =>
    mockUpdate(updates),
  onValue: (
    reference: { path: string },
    callback: (snapshot: { val: () => unknown }) => void,
  ) => {
    mockOnValueCallbacks.set(reference.path, callback)
    return () => mockOnValueCallbacks.delete(reference.path)
  },
}))

function fireRemoteSnapshot(path: string, value: unknown) {
  mockOnValueCallbacks.get(path)?.({ val: () => value })
}

function uniqueDbName() {
  return `local-first-context-test-${Math.random()}`
}

// idb-keyval's reads/writes resolve over several real event-loop turns, not
// one microtask, so this loops a few real timer ticks to let them settle.
async function flushMicrotasks() {
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

async function setUpContext() {
  const { context, hydrate } = createLocalFirstContext(
    {} as import("firebase/database").Database,
    uniqueDbName(),
  )
  await hydrate()
  return context
}

beforeEach(() => {
  mockOnValueCallbacks.clear()
})

describe("createLocalFirstContext", () => {
  it("addItem writes locally immediately and is readable via useValue", async () => {
    const context = await setUpContext()

    const id = context.addItem<{ id: string; description: string }>("work", {
      description: "Chores",
    })

    const { result } = renderHook(() =>
      context.useValue<Record<string, { description: string }>>("work"),
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.value?.[id!].description).toBe("Chores")
  })

  it("addItem enqueues a write op that the sync engine pushes to Firebase", async () => {
    const context = await setUpContext()

    const id = context.addItem<{ id: string; description: string }>("work", {
      description: "Chores",
    })

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        [`work/${id}`]: expect.objectContaining({ description: "Chores" }),
      })
    })
  })

  it("deleteItem removes the item locally and syncs the deletion to the real database", async () => {
    const context = await setUpContext()
    const item = { id: "task1", description: "Chores" }
    context.updateItem("work", item)

    context.deleteItem("work", item)

    const { result } = renderHook(() =>
      context.useValue<Record<string, unknown>>("work"),
    )
    expect(result.current.value).toBeUndefined()

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ "work/task1": null })
    })
  })

  it("setValue stores a bare primitive, not just objects", async () => {
    const context = await setUpContext()

    context.setValue("dailyReset", 12345)

    const { result } = renderHook(() => context.useValue<number>("dailyReset"))
    expect(result.current.value).toBe(12345)
  })

  it("applies a remote snapshot when nothing local is pending for that key", async () => {
    const context = await setUpContext()
    const { result } = renderHook(() =>
      context.useValue<Record<string, unknown>>("work"),
    )

    await waitFor(() => expect(mockOnValueCallbacks.has("work")).toBe(true))

    fireRemoteSnapshot("work", { task1: { id: "task1", description: "Remote" } })

    await waitFor(() => {
      expect(result.current.value).toEqual({
        task1: { id: "task1", description: "Remote" },
      })
    })
  })

  it("moveItemBetweenLists writes both lists locally and syncs as one atomic update", async () => {
    const context = await setUpContext()
    const movedItem = { id: "task1", position: 0 }
    const stayingItem = { id: "task2", position: 0 }
    context.updateItem("work/list2/items", stayingItem)

    context.moveItemBetweenLists({
      movedItem,
      sourceListId: "work/list1/items",
      targetListId: "work/list2/items",
      targetListItems: [stayingItem],
    })

    const { result: source } = renderHook(() =>
      context.useValue<Record<string, unknown>>("work/list1/items"),
    )
    const { result: target } = renderHook(() =>
      context.useValue<Record<string, unknown>>("work/list2/items"),
    )
    expect(source.current.value?.task1).toBeUndefined()
    expect(target.current.value?.task1).toEqual(movedItem)
    expect(target.current.value?.task2).toEqual({ id: "task2", position: 1 })

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        "work/list2/items/task1": movedItem,
        "work/list1/items/task1": null,
        "work/list2/items/task2/position": 1,
      })
    })
  })

  it("ignores a stale remote snapshot while a local write for that key is still unsynced", async () => {
    const context = await setUpContext()
    mockUpdate.mockImplementation(() => new Promise(() => {}))
    const item = { id: "task1", description: "Local edit" }

    context.updateItem("work", item)

    const { result } = renderHook(() =>
      context.useValue<Record<string, unknown>>("work"),
    )
    await waitFor(() => expect(mockOnValueCallbacks.has("work")).toBe(true))

    fireRemoteSnapshot("work", { task1: { id: "task1", description: "Stale" } })
    await flushMicrotasks()

    expect(result.current.value).toEqual({ task1: item })
  })
})
