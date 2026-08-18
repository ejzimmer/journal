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
    renderWithContext({
      b: { id: "b", description: "create PR", position: 1 },
      a: { id: "a", description: "test", position: 0 },
    })

    const list = screen.getByText("[", { exact: false })
    expect(list).toHaveTextContent("[test, create PR]")
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

  it("doesn't show a gap to insert into when there's only one subtask", () => {
    renderWithContext({ a: { id: "a", description: "test", position: 0 } })

    expect(
      screen.queryByRole("button", { name: "Insert subtask here" }),
    ).not.toBeInTheDocument()
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
