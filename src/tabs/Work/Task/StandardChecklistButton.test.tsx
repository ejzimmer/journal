import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { StandardChecklistButton } from "./StandardChecklistButton"
import { STANDARD_CHECKLIST, Subtask } from "../types"

const mockContext = {
  addItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  updateList: jest.fn(),
  useValue: jest.fn(),
}

function renderWithContext(subtasks?: Record<string, Subtask>) {
  return render(
    <FirebaseContext.Provider value={mockContext}>
      <StandardChecklistButton
        subtasks={subtasks}
        path="work/list-1/items/task-1/subtasks"
      />
    </FirebaseContext.Provider>,
  )
}

describe("StandardChecklistButton", () => {
  it("adds all the standard checklist items when there are no existing subtasks", async () => {
    const user = userEvent.setup()
    renderWithContext()

    await user.click(screen.getByRole("button", { name: "Add standard checklist" }))

    expect(mockContext.addItem).toHaveBeenCalledTimes(STANDARD_CHECKLIST.length)
    STANDARD_CHECKLIST.forEach((description, index) => {
      expect(mockContext.addItem).toHaveBeenCalledWith(
        "work/list-1/items/task-1/subtasks",
        { description, position: index },
      )
    })
  })

  it("skips items that already exist, case-insensitively", async () => {
    const user = userEvent.setup()
    renderWithContext({
      a: { id: "a", description: "Test", position: 0 },
      b: { id: "b", description: "build", position: 1 },
    })

    await user.click(screen.getByRole("button", { name: "Add standard checklist" }))

    expect(mockContext.addItem).toHaveBeenCalledTimes(STANDARD_CHECKLIST.length - 2)
    expect(mockContext.addItem).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ description: "test" }),
    )
    expect(mockContext.addItem).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ description: "build" }),
    )
  })

  it("is disabled once every standard item already exists", () => {
    const subtasks = Object.fromEntries(
      STANDARD_CHECKLIST.map((description, index) => [
        `id-${index}`,
        { id: `id-${index}`, description, position: index },
      ]),
    )
    renderWithContext(subtasks)

    expect(
      screen.getByRole("button", { name: "Add standard checklist" }),
    ).toBeDisabled()
  })
})
