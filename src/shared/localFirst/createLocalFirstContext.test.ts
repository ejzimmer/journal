import "fake-indexeddb/auto"
import { renderHook, waitFor } from "@testing-library/react"
import { createLocalFirstContext } from "./createLocalFirstContext"

const mockSet = jest.fn().mockResolvedValue(undefined)
const mockRemove = jest.fn().mockResolvedValue(undefined)
const mockOnValueCallbacks = new Map<string, (snapshot: { val: () => unknown }) => void>()

jest.mock("firebase/database", () => ({
  ref: (_database: unknown, path: string) => ({ path }),
  set: (reference: { path: string }, value: unknown) =>
    mockSet(reference.path, value),
  remove: (reference: { path: string }) => mockRemove(reference.path),
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
      expect(mockSet).toHaveBeenCalledWith(
        `work/${id}`,
        expect.objectContaining({ description: "Chores" }),
      )
    })
  })

  it("deleteItem removes the item locally and calls remove on the real database", async () => {
    const context = await setUpContext()
    const item = { id: "task1", description: "Chores" }
    context.updateItem("work", item)

    context.deleteItem("work", item)

    const { result } = renderHook(() =>
      context.useValue<Record<string, unknown>>("work"),
    )
    expect(result.current.value).toBeUndefined()

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith("work/task1")
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

    // Subscribing triggers the remote listener registration.
    await waitFor(() => expect(mockOnValueCallbacks.has("work")).toBe(true))

    fireRemoteSnapshot("work", { task1: { id: "task1", description: "Remote" } })

    await waitFor(() => {
      expect(result.current.value).toEqual({
        task1: { id: "task1", description: "Remote" },
      })
    })
  })

  it("ignores a stale remote snapshot while a local write for that key is still unsynced", async () => {
    const context = await setUpContext()
    mockSet.mockImplementation(() => new Promise(() => {})) // never resolves
    const item = { id: "task1", description: "Local edit" }

    context.updateItem("work", item)

    const { result } = renderHook(() =>
      context.useValue<Record<string, unknown>>("work"),
    )
    await waitFor(() => expect(mockOnValueCallbacks.has("work")).toBe(true))

    fireRemoteSnapshot("work", { task1: { id: "task1", description: "Stale" } })
    // Give the outbox-check microtask a chance to run.
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(result.current.value).toEqual({ task1: item })
  })
})
