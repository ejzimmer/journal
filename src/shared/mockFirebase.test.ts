import { act, renderHook, waitFor } from "@testing-library/react"
import { createMockFirebaseContext } from "./mockFirebase"

describe("createMockFirebaseContext", () => {
  it("addItem generates an id and stores the item under the parent", async () => {
    const context = createMockFirebaseContext()

    const id = context.addItem<{ id: string; description: string }>("lists", {
      description: "Backlog",
    })

    const { result } = renderHook(() =>
      context.useValue<Record<string, { id: string; description: string }>>(
        "lists",
      ),
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.value?.[id!]).toEqual({
      id,
      description: "Backlog",
    })
  })

  it("seeds initial data", async () => {
    const context = createMockFirebaseContext({
      lists: { "list-1": { id: "list-1", description: "Backlog" } },
    })

    const { result } = renderHook(() =>
      context.useValue<Record<string, unknown>>("lists"),
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.value).toEqual({
      "list-1": { id: "list-1", description: "Backlog" },
    })
  })

  it("updateItem overwrites the item at its id", async () => {
    const context = createMockFirebaseContext({
      lists: { "list-1": { id: "list-1", description: "Backlog" } },
    })

    act(() => {
      context.updateItem("lists", { id: "list-1", description: "Renamed" })
    })

    const { result } = renderHook(() =>
      context.useValue<Record<string, { description: string }>>("lists"),
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.value?.["list-1"].description).toBe("Renamed")
  })

  it("deleteItem removes the item", async () => {
    const context = createMockFirebaseContext({
      lists: { "list-1": { id: "list-1", description: "Backlog" } },
    })

    act(() => {
      context.deleteItem("lists", { id: "list-1" })
    })

    const { result } = renderHook(() =>
      context.useValue<Record<string, unknown>>("lists"),
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.value).toBeUndefined()
  })

  it("updateList replaces the whole list, keyed by id", async () => {
    const context = createMockFirebaseContext({
      items: { a: { id: "a", position: 0 }, b: { id: "b", position: 1 } },
    })

    act(() => {
      context.updateList("items", [{ id: "b", position: 0 }])
    })

    const { result } = renderHook(() =>
      context.useValue<Record<string, { position: number }>>("items"),
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.value).toEqual({ b: { id: "b", position: 0 } })
  })

  it("doesn't re-render a subscriber when a write resolves to the same value", async () => {
    // Regression guard: the Work tab re-writes each list's items on an
    // effect that re-runs whenever the list value's reference changes. If
    // writing back identical content produced a new reference anyway (as a
    // naive "always fire" implementation would), that effect would loop
    // forever — matching real Firebase's onValue, which only calls back
    // when the resolved value actually differs, breaks the cycle.
    const context = createMockFirebaseContext({
      items: { a: { id: "a", position: 0 } },
    })

    const { result } = renderHook(() =>
      context.useValue<Record<string, unknown>>("items"),
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    const before = result.current

    act(() => {
      context.updateList("items", [{ id: "a", position: 0 }])
    })

    expect(result.current).toBe(before)
  })

  it("notifies a subscriber watching a parent path when a child changes", async () => {
    const context = createMockFirebaseContext({
      work: { "list-1": { id: "list-1", items: {} } },
    })

    const { result } = renderHook(() =>
      context.useValue<Record<string, unknown>>("work"),
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      context.addItem("work/list-1/items", { description: "New task" })
    })

    await waitFor(() => {
      const list = result.current.value?.["list-1"] as { items?: object }
      expect(Object.keys(list.items ?? {})).toHaveLength(1)
    })
  })

  it("gives a subscriber watching a parent path a new object reference on a nested write", async () => {
    // Regression guard: writes used to mutate nested objects in place, so
    // e.g. data.work kept the same reference even after data.work.list-1
    // changed. Consumers like Work/index.tsx read the value through
    // useMemo([lists, ...]) — same reference means "nothing changed", so a
    // real UI would silently miss the update even though the data store
    // itself was correct.
    const context = createMockFirebaseContext({
      work: { "list-1": { id: "list-1", items: {} } },
    })

    const { result } = renderHook(() =>
      context.useValue<Record<string, unknown>>("work"),
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    const before = result.current.value

    act(() => {
      context.addItem("work", { description: "New list" })
    })

    await waitFor(() => expect(result.current.value).not.toBe(before))
  })

  it("notifies a subscriber watching a nested path when an ancestor is overwritten", async () => {
    const context = createMockFirebaseContext({
      work: { "list-1": { id: "list-1", items: { a: { id: "a" } } } },
    })

    const { result } = renderHook(() =>
      context.useValue<{ id: string }>("work/list-1/items/a"),
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.value).toEqual({ id: "a" })

    act(() => {
      context.deleteItem("work", { id: "list-1" })
    })

    await waitFor(() => expect(result.current.value).toBeUndefined())
  })
})
