import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Subtasks } from "./Subtasks"
import { WorkStorageContext, WorkStorageContextType } from "../WorkStorageContext"
import { createWorkStorageContext } from "../workStorageTestUtils"
import { Subtask } from "../types"

function renderWithContext(
  subtasks: Record<string, Subtask> | undefined,
  storageContext: WorkStorageContextType = createWorkStorageContext(),
) {
  return render(
    <WorkStorageContext.Provider value={storageContext}>
      <Subtasks subtasks={subtasks} listId="list-1" taskId="task-1" />
    </WorkStorageContext.Provider>,
  )
}

describe("Subtasks", () => {
  it("renders nothing when there are no subtasks", () => {
    const { container } = renderWithContext(undefined)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders subtask descriptions in position order, separated by commas", () => {
    const { container } = renderWithContext({
      b: { id: "b", description: "create PR", position: 1 },
      a: { id: "a", description: "test", position: 0 },
    })

    expect(container.querySelector(".subtasks")).toHaveTextContent(
      "[test, create PR]",
    )
  })

  it("deletes a subtask when it's clicked", async () => {
    const user = userEvent.setup()
    const subtask = { id: "a", description: "test", position: 0 }
    const storageContext = createWorkStorageContext()
    renderWithContext({ a: subtask }, storageContext)

    await user.click(screen.getByRole("button", { name: "test" }))

    expect(storageContext.deleteSubtask).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      subtask,
    )
  })

  it("inserts a subtask between two existing ones", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    renderWithContext(
      {
        a: { id: "a", description: "test", position: 0 },
        b: { id: "b", description: "build", position: 1 },
      },
      storageContext,
    )

    await user.click(screen.getByRole("button", { name: "Insert subtask here" }))
    await user.type(
      screen.getByRole("textbox", { name: "Insert subtask" }),
      "review{Enter}",
    )

    expect(storageContext.setSubtasks).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      [
        { id: "a", description: "test", position: 0 },
        { id: expect.any(String), description: "review", position: 1 },
        { id: "b", description: "build", position: 2 },
      ],
    )
  })

  it("inserts a subtask before the first one by clicking the opening bracket", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    renderWithContext(
      {
        a: { id: "a", description: "test", position: 0 },
        b: { id: "b", description: "build", position: 1 },
      },
      storageContext,
    )

    await user.click(
      screen.getByRole("button", { name: "Insert subtask at start" }),
    )
    await user.type(
      screen.getByRole("textbox", { name: "Insert subtask" }),
      "review{Enter}",
    )

    expect(storageContext.setSubtasks).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      [
        { id: expect.any(String), description: "review", position: 0 },
        { id: "a", description: "test", position: 1 },
        { id: "b", description: "build", position: 2 },
      ],
    )
  })

  it("inserts a subtask after the last one by clicking the closing bracket", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    renderWithContext(
      {
        a: { id: "a", description: "test", position: 0 },
        b: { id: "b", description: "build", position: 1 },
      },
      storageContext,
    )

    await user.click(
      screen.getByRole("button", { name: "Insert subtask at end" }),
    )
    await user.type(
      screen.getByRole("textbox", { name: "Insert subtask" }),
      "review{Enter}",
    )

    expect(storageContext.setSubtasks).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      [
        { id: "a", description: "test", position: 0 },
        { id: "b", description: "build", position: 1 },
        { id: expect.any(String), description: "review", position: 2 },
      ],
    )
  })

  it("allows inserting before or after a single subtask via the brackets", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    renderWithContext(
      { a: { id: "a", description: "test", position: 0 } },
      storageContext,
    )

    expect(
      screen.queryByRole("button", { name: "Insert subtask here" }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Insert subtask at start" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Insert subtask at end" }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", { name: "Insert subtask at end" }),
    )
    await user.type(
      screen.getByRole("textbox", { name: "Insert subtask" }),
      "review{Enter}",
    )

    expect(storageContext.setSubtasks).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      [
        { id: "a", description: "test", position: 0 },
        { id: expect.any(String), description: "review", position: 1 },
      ],
    )
  })

  it("doesn't insert a subtask with no description", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    renderWithContext(
      {
        a: { id: "a", description: "test", position: 0 },
        b: { id: "b", description: "build", position: 1 },
      },
      storageContext,
    )

    await user.click(screen.getByRole("button", { name: "Insert subtask here" }))
    await user.keyboard("{Enter}")

    expect(storageContext.setSubtasks).not.toHaveBeenCalled()
  })

  it("cancels inserting without adding when Escape is pressed", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    renderWithContext(
      {
        a: { id: "a", description: "test", position: 0 },
        b: { id: "b", description: "build", position: 1 },
      },
      storageContext,
    )

    await user.click(screen.getByRole("button", { name: "Insert subtask here" }))
    await user.type(
      screen.getByRole("textbox", { name: "Insert subtask" }),
      "review",
    )
    await user.keyboard("{Escape}")

    expect(storageContext.setSubtasks).not.toHaveBeenCalled()
    expect(
      screen.getByRole("button", { name: "Insert subtask here" }),
    ).toBeInTheDocument()
  })
})
