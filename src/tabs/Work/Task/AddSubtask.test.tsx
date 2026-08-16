import { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { AddSubtask } from "./AddSubtask"
import { STANDARD_CHECKLIST, Subtask } from "../types"

// Mimics Firebase's real-time updates: addItem writes into real state, so
// the component tree re-renders (and the standard checklist button can
// unmount itself) the same way it does against the real backend.
function AddSubtaskWithLiveBackend({
  addItemSpy,
}: {
  addItemSpy: jest.Mock
}) {
  const [subtasks, setSubtasks] = useState<Record<string, Subtask>>({})

  const addItem = <T,>(path: string, item: Omit<T, "id">) => {
    addItemSpy(path, item)
    const id = `id-${Math.random()}`
    setSubtasks((current) => ({
      ...current,
      [id]: { id, ...item } as unknown as Subtask,
    }))
    return id
  }

  return (
    <FirebaseContext.Provider
      value={{
        addItem,
        updateItem: jest.fn(),
        deleteItem: jest.fn(),
        updateList: jest.fn(),
        useValue: jest.fn(),
      }}
    >
      <AddSubtask path="work/list-1/items/task-1/subtasks" subtasks={subtasks} />
    </FirebaseContext.Provider>
  )
}

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
      { description: "test" },
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

  it("doesn't show the standard checklist button until the form is open", async () => {
    const user = userEvent.setup()
    renderWithContext()

    expect(
      screen.queryByRole("button", { name: "Add standard checklist" }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Add subtask" }))

    expect(
      screen.getByRole("button", { name: "Add standard checklist" }),
    ).toBeInTheDocument()
  })

  it("adds the standard checklist without closing the form", async () => {
    const user = userEvent.setup()
    renderWithContext()

    await user.click(screen.getByRole("button", { name: "Add subtask" }))
    await user.click(
      screen.getByRole("button", { name: "Add standard checklist" }),
    )

    expect(mockContext.addItem).toHaveBeenCalledTimes(STANDARD_CHECKLIST.length)
    expect(
      screen.getByRole("textbox", { name: "New subtask" }),
    ).toBeInTheDocument()
  })

  it("keeps the form open and focused after the checklist button removes itself", async () => {
    const user = userEvent.setup()
    const addItemSpy = jest.fn()
    render(<AddSubtaskWithLiveBackend addItemSpy={addItemSpy} />)

    await user.click(screen.getByRole("button", { name: "Add subtask" }))
    // Once every standard item exists this button hides itself (see
    // StandardChecklistButton) - clicking it moves focus off the input and
    // then removes the just-focused button from the DOM in the same tick.
    await user.click(
      screen.getByRole("button", { name: "Add standard checklist" }),
    )

    expect(
      screen.queryByRole("button", { name: "Add standard checklist" }),
    ).not.toBeInTheDocument()
    const input = screen.getByRole("textbox", { name: "New subtask" })
    expect(input).toHaveFocus()

    await user.type(input, "one more{Enter}")
    expect(addItemSpy).toHaveBeenCalledWith(
      "work/list-1/items/task-1/subtasks",
      { description: "one more" },
    )
  })
})
