import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { AddSubtask } from "./AddSubtask"

const mockContext = {
  addItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  updateList: jest.fn(),
  useValue: jest.fn(),
}

function renderWithContext() {
  return render(
    <FirebaseContext.Provider value={mockContext}>
      <AddSubtask path="work/list-1/items/task-1/subtasks" />
    </FirebaseContext.Provider>,
  )
}

describe("AddSubtask", () => {
  it("adds a subtask on enter", async () => {
    const user = userEvent.setup()
    renderWithContext()

    await user.click(screen.getByRole("button", { name: "Add subtask" }))
    await user.type(screen.getByRole("textbox", { name: "New subtask" }), "test{Enter}")

    expect(mockContext.addItem).toHaveBeenCalledWith(
      "work/list-1/items/task-1/subtasks",
      { description: "test", position: 0 },
    )
  })

  it("doesn't add a subtask with no description", async () => {
    const user = userEvent.setup()
    renderWithContext()

    await user.click(screen.getByRole("button", { name: "Add subtask" }))
    await user.keyboard("{Enter}")

    expect(mockContext.addItem).not.toHaveBeenCalled()
  })

  it("cancels without adding when Escape is pressed", async () => {
    const user = userEvent.setup()
    renderWithContext()

    await user.click(screen.getByRole("button", { name: "Add subtask" }))
    await user.type(screen.getByRole("textbox", { name: "New subtask" }), "test")
    await user.keyboard("{Escape}")

    expect(mockContext.addItem).not.toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Add subtask" })).toBeInTheDocument()
  })

  it("positions a new subtask after existing ones", async () => {
    const user = userEvent.setup()
    render(
      <FirebaseContext.Provider value={mockContext}>
        <AddSubtask
          path="work/list-1/items/task-1/subtasks"
          subtasks={{
            a: { id: "a", description: "test", position: 0 },
            b: { id: "b", description: "review", position: 1 },
          }}
        />
      </FirebaseContext.Provider>,
    )

    await user.click(screen.getByRole("button", { name: "Add subtask" }))
    await user.type(screen.getByRole("textbox", { name: "New subtask" }), "PR{Enter}")

    expect(mockContext.addItem).toHaveBeenCalledWith(
      "work/list-1/items/task-1/subtasks",
      { description: "PR", position: 2 },
    )
  })
})
