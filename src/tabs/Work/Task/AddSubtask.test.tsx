import { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { WorkStorageContext, WorkStorageContextType } from "../WorkStorageContext"
import { AddSubtask } from "./AddSubtask"
import { STANDARD_CHECKLIST, Subtask } from "../types"

function createStorageContext(
  overrides: Partial<WorkStorageContextType> = {},
): WorkStorageContextType {
  return {
    lists: undefined,
    loading: false,
    addList: jest.fn(),
    updateList: jest.fn(),
    deleteList: jest.fn(),
    reorderLists: jest.fn(),
    addTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    reorderTasks: jest.fn(),
    addSubtask: jest.fn(),
    deleteSubtask: jest.fn(),
    getList: () => undefined,
    getTask: () => undefined,
    ...overrides,
  }
}

// Mimics Firebase's real-time updates: addSubtask writes into real state, so
// the component tree re-renders (and the standard checklist button can
// unmount itself) the same way it does against the real backend.
function AddSubtaskWithLiveBackend({
  addSubtaskSpy,
}: {
  addSubtaskSpy: jest.Mock
}) {
  const [subtasks, setSubtasks] = useState<Record<string, Subtask>>({})

  const addSubtask = (listId: string, taskId: string, description: string) => {
    addSubtaskSpy(listId, taskId, description)
    const id = `id-${Math.random()}`
    setSubtasks((current) => ({
      ...current,
      [id]: { id, description },
    }))
  }

  return (
    <WorkStorageContext.Provider value={createStorageContext({ addSubtask })}>
      <AddSubtask listId="list-1" taskId="task-1" subtasks={subtasks} />
    </WorkStorageContext.Provider>
  )
}

function renderWithContext(storageContext: WorkStorageContextType) {
  return render(
    <WorkStorageContext.Provider value={storageContext}>
      <AddSubtask listId="list-1" taskId="task-1" />
    </WorkStorageContext.Provider>,
  )
}

describe("AddSubtask", () => {
  it("adds a subtask on enter", async () => {
    const user = userEvent.setup()
    const storageContext = createStorageContext()
    renderWithContext(storageContext)

    await user.click(screen.getByRole("button", { name: "Add subtask" }))
    await user.type(
      screen.getByRole("textbox", { name: "New subtask" }),
      "test{Enter}",
    )

    expect(storageContext.addSubtask).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      "test",
    )
  })

  it("doesn't add a subtask with no description", async () => {
    const user = userEvent.setup()
    const storageContext = createStorageContext()
    renderWithContext(storageContext)

    await user.click(screen.getByRole("button", { name: "Add subtask" }))
    await user.keyboard("{Enter}")

    expect(storageContext.addSubtask).not.toHaveBeenCalled()
  })

  it("cancels without adding when Escape is pressed", async () => {
    const user = userEvent.setup()
    const storageContext = createStorageContext()
    renderWithContext(storageContext)

    await user.click(screen.getByRole("button", { name: "Add subtask" }))
    await user.type(
      screen.getByRole("textbox", { name: "New subtask" }),
      "test",
    )
    await user.keyboard("{Escape}")

    expect(storageContext.addSubtask).not.toHaveBeenCalled()
    expect(
      screen.getByRole("button", { name: "Add subtask" }),
    ).toBeInTheDocument()
  })

  it("doesn't show the standard checklist button until the form is open", async () => {
    const user = userEvent.setup()
    renderWithContext(createStorageContext())

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
    const storageContext = createStorageContext()
    renderWithContext(storageContext)

    await user.click(screen.getByRole("button", { name: "Add subtask" }))
    await user.click(
      screen.getByRole("button", { name: "Add standard checklist" }),
    )

    expect(storageContext.addSubtask).toHaveBeenCalledTimes(
      STANDARD_CHECKLIST.length,
    )
    expect(
      screen.getByRole("textbox", { name: "New subtask" }),
    ).toBeInTheDocument()
  })

  it("keeps the form open and focused after the checklist button removes itself", async () => {
    const user = userEvent.setup()
    const addSubtaskSpy = jest.fn()
    render(<AddSubtaskWithLiveBackend addSubtaskSpy={addSubtaskSpy} />)

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
    expect(addSubtaskSpy).toHaveBeenCalledWith("list-1", "task-1", "one more")
  })
})
