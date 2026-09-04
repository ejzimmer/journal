import { createMockFirebaseContext } from "./mockFirebase"

describe("createMockFirebaseContext deleteItem", () => {
  it("deletes an item that exists without logging anything", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation()
    const context = createMockFirebaseContext({
      list: { "item-1": { id: "item-1", description: "a task" } },
    })

    context.deleteItem("list", { id: "item-1" })

    expect(context.useValue).toBeDefined()
    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it("logs an error when the item isn't found at the expected path", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation()
    const context = createMockFirebaseContext({
      list: { "item-1": { id: "item-1", description: "a task" } },
    })

    context.deleteItem("list", { id: "item-2" })

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('deleteItem found nothing at "list/item-2"'),
      { id: "item-2" },
    )
    errorSpy.mockRestore()
  })

  it("logs an error and refuses to delete when the item has no id", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation()
    const context = createMockFirebaseContext({
      list: { "item-1": { id: "item-1", description: "a task" } },
    })

    context.deleteItem("list", { id: "" })

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("deleteItem called with no id"),
      { id: "" },
    )
    errorSpy.mockRestore()
  })
})
