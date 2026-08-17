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

  it("renders subtask descriptions in order, separated by commas", () => {
    renderWithContext({
      b: { id: "b", description: "create PR" },
      a: { id: "a", description: "test" },
    })

    const list = screen.getByText("[", { exact: false })
    expect(list).toHaveTextContent("[test, create PR]")
  })

  it("deletes a subtask when it's clicked", async () => {
    const user = userEvent.setup()
    const subtask = { id: "a", description: "test" }
    const storageContext = createWorkStorageContext()
    renderWithContext({ a: subtask }, storageContext)

    await user.click(screen.getByRole("button", { name: "test" }))

    expect(storageContext.deleteSubtask).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      subtask,
    )
  })
})
