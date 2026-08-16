import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { Subtasks } from "./Subtasks"
import { Subtask } from "../types"

const mockContext = {
  addItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  updateList: jest.fn(),
  useValue: jest.fn(),
}

function renderWithContext(subtasks: Record<string, Subtask> | undefined) {
  return render(
    <FirebaseContext.Provider value={mockContext}>
      <Subtasks subtasks={subtasks} path="work/list-1/items/task-1/subtasks" />
    </FirebaseContext.Provider>,
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
    renderWithContext({ a: subtask })

    await user.click(screen.getByRole("button", { name: "test" }))

    expect(mockContext.deleteItem).toHaveBeenCalledWith(
      "work/list-1/items/task-1/subtasks",
      subtask,
    )
  })
})
