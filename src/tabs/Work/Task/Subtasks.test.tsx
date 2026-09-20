import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Subtasks } from "./Subtasks"
import { WorkStorageContextType } from "../WorkStorageContext"
import { renderWithWorkStorage } from "../workStorageTestUtils"
import { STANDARD_CHECKLIST, Subtask, WorkTask } from "../types"

function renderWithContext(
  subtasks: Record<string, Subtask> | undefined,
  overrides: Partial<WorkStorageContextType> = {},
) {
  return renderWithWorkStorage(
    <Subtasks subtasks={subtasks} listId="list-1" taskId="task-1" />,
    { getTask: () => ({ subtasks }) as WorkTask, ...overrides },
  )
}

const openEditor = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getAllByRole("button", { name: "Edit subtasks" })[0])

describe("Subtasks", () => {
  it("shows the add subtask and add standard checklist buttons when there are no subtasks", () => {
    renderWithContext(undefined)

    expect(
      screen.getByRole("button", { name: "Add subtask" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Add standard checklist" }),
    ).toBeInTheDocument()
  })

  it("renders subtask descriptions in position order", () => {
    renderWithContext({
      b: { id: "b", description: "create PR", position: 1 },
      a: { id: "a", description: "test", position: 0 },
    })

    expect(
      screen
        .getAllByRole("button", { name: /test|create PR/ })
        .map((subtask) => subtask.textContent),
    ).toEqual(["test", "create PR"])
  })

  it("wraps the subtasks in brackets and comma separators that open the editor", () => {
    renderWithContext({
      b: { id: "b", description: "create PR", position: 1 },
      a: { id: "a", description: "test", position: 0 },
    })

    expect(
      screen
        .getAllByRole("button", { name: "Edit subtasks" })
        .map((button) => button.textContent),
    ).toEqual(["[", ",\u00a0", "]"])
  })

  it("doesn't show the add subtask button once there are subtasks", () => {
    renderWithContext({
      a: { id: "a", description: "test", position: 0 },
    })

    expect(
      screen.queryByRole("button", { name: "Add subtask" }),
    ).not.toBeInTheDocument()
  })

  it("still shows the add standard checklist button once there are subtasks, if not all standard items are added", () => {
    renderWithContext({
      a: { id: "a", description: "test", position: 0 },
    })

    expect(
      screen.getByRole("button", { name: "Add standard checklist" }),
    ).toBeInTheDocument()
  })

  it("hides the add standard checklist button once every standard item has been added", () => {
    const subtasks = Object.fromEntries(
      [...STANDARD_CHECKLIST.entries()].map(([id, description]) => [
        id,
        { id, description, position: 0 },
      ]),
    )
    renderWithContext(subtasks)

    expect(
      screen.queryByRole("button", { name: "Add standard checklist" }),
    ).not.toBeInTheDocument()
  })

  it("deletes a subtask when it's clicked", async () => {
    const user = userEvent.setup()
    const subtask = { id: "a", description: "test", position: 0 }
    const { storageContext } = renderWithContext({ a: subtask })

    await user.click(screen.getByRole("button", { name: "test" }))

    expect(storageContext.deleteSubtask).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      subtask,
    )
  })

  it("opens the editor prefilled with the current list when a bracket is clicked", async () => {
    const user = userEvent.setup()
    renderWithContext({
      a: { id: "a", description: "test", position: 0 },
      b: { id: "b", description: "build", position: 1 },
    })

    await openEditor(user)

    expect(
      screen.getByRole("textbox", { name: "Edit subtasks" }),
    ).toHaveValue("test, build")
  })

  it("opens the same edit form when the add subtask button is clicked", async () => {
    const user = userEvent.setup()
    renderWithContext(undefined)

    await user.click(screen.getByRole("button", { name: "Add subtask" }))

    expect(
      screen.getByRole("textbox", { name: "Edit subtasks" }),
    ).toHaveValue("")
  })

  it("parses a comma separated list into new subtasks when adding", async () => {
    const user = userEvent.setup()
    const { storageContext } = renderWithContext(undefined)

    await user.click(screen.getByRole("button", { name: "Add subtask" }))
    await user.type(
      screen.getByRole("textbox", { name: "Edit subtasks" }),
      "test, review{Enter}",
    )

    expect(storageContext.updateSubtasksList).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      [
        { id: expect.any(String), description: "test", position: 0 },
        { id: expect.any(String), description: "review", position: 1 },
      ],
    )
  })

  it("doesn't save anything when the form is submitted empty", async () => {
    const user = userEvent.setup()
    const { storageContext } = renderWithContext(undefined)

    await user.click(screen.getByRole("button", { name: "Add subtask" }))
    await user.keyboard("{Enter}")

    expect(storageContext.updateSubtasksList).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      [],
    )
  })

  it("cancels without adding when Escape is pressed", async () => {
    const user = userEvent.setup()
    const { storageContext } = renderWithContext(undefined)

    await user.click(screen.getByRole("button", { name: "Add subtask" }))
    await user.type(
      screen.getByRole("textbox", { name: "Edit subtasks" }),
      "test",
    )
    await user.keyboard("{Escape}")

    expect(storageContext.updateSubtasksList).not.toHaveBeenCalled()
    expect(
      screen.getByRole("button", { name: "Add subtask" }),
    ).toBeInTheDocument()
  })

  it("parses the edited text into a new subtask list when Enter is pressed", async () => {
    const user = userEvent.setup()
    const { storageContext } = renderWithContext({
      a: { id: "a", description: "test", position: 0 },
      b: { id: "b", description: "build", position: 1 },
    })

    await openEditor(user)
    const input = screen.getByRole("textbox", { name: "Edit subtasks" })
    await user.clear(input)
    await user.type(input, "test, review, build{Enter}")

    expect(storageContext.updateSubtasksList).toHaveBeenCalledWith("list-1", "task-1", [
      { id: "a", description: "test", position: 0 },
      { id: expect.any(String), description: "review", position: 1 },
      { id: "b", description: "build", position: 2 },
    ])
  })

  it("filters out blank entries when saving", async () => {
    const user = userEvent.setup()
    const { storageContext } = renderWithContext({
      a: { id: "a", description: "test", position: 0 },
    })

    await openEditor(user)
    const input = screen.getByRole("textbox", { name: "Edit subtasks" })
    await user.clear(input)
    await user.type(input, "test, , build,{Enter}")

    expect(storageContext.updateSubtasksList).toHaveBeenCalledWith("list-1", "task-1", [
      { id: "a", description: "test", position: 0 },
      { id: expect.any(String), description: "build", position: 1 },
    ])
  })

  it("cancels without saving when Escape is pressed while editing an existing list", async () => {
    const user = userEvent.setup()
    const { storageContext } = renderWithContext({
      a: { id: "a", description: "test", position: 0 },
    })

    await openEditor(user)
    const input = screen.getByRole("textbox", { name: "Edit subtasks" })
    await user.type(input, ", extra")
    await user.keyboard("{Escape}")

    expect(storageContext.updateSubtasksList).not.toHaveBeenCalled()
    expect(input).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "test" })).toBeInTheDocument()
  })

  it("returns focus to the brackets when the editor closes", async () => {
    const user = userEvent.setup()
    renderWithContext({ a: { id: "a", description: "test", position: 0 } })

    await openEditor(user)
    await user.keyboard("{Escape}")

    expect(screen.getAllByRole("button", { name: "Edit subtasks" })[0]).toHaveFocus()
  })
})
