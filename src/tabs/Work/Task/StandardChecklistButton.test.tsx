import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StandardChecklistButton } from "./StandardChecklistButton"
import { WorkStorageContext, WorkStorageContextType } from "../WorkStorageContext"
import { createWorkStorageContext } from "../workStorageTestUtils"
import { STANDARD_CHECKLIST, Subtask } from "../types"

function renderWithContext(
  subtasks?: Record<string, Subtask>,
  storageContext: WorkStorageContextType = createWorkStorageContext(),
) {
  return render(
    <WorkStorageContext.Provider value={storageContext}>
      <StandardChecklistButton
        subtasks={subtasks}
        listId="list-1"
        taskId="task-1"
      />
    </WorkStorageContext.Provider>,
  )
}

const idFor = (description: string) =>
  `standard-${description.toLowerCase().replace(/\s+/g, "-")}`

describe("StandardChecklistButton", () => {
  it("adds all the standard checklist items, in the declared order, when there are no existing subtasks", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    renderWithContext(undefined, storageContext)

    await user.click(
      screen.getByRole("button", { name: "Add standard checklist" }),
    )

    expect(storageContext.setSubtasks).toHaveBeenCalledTimes(1)
    expect(storageContext.setSubtasks).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      STANDARD_CHECKLIST.map((description, index) => ({
        id: idFor(description),
        description,
        position: index,
      })),
    )
  })

  it("skips items that already exist, case-insensitively, and appends the missing ones after them in declared order", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    const existingTest = { id: "a", description: "Test", position: 0 }
    const existingBuild = { id: "b", description: "build", position: 1 }
    renderWithContext(
      { a: existingTest, b: existingBuild },
      storageContext,
    )

    await user.click(
      screen.getByRole("button", { name: "Add standard checklist" }),
    )

    const missing = STANDARD_CHECKLIST.filter(
      (description) => !["test", "build"].includes(description.toLowerCase()),
    )
    expect(storageContext.setSubtasks).toHaveBeenCalledWith("list-1", "task-1", [
      existingTest,
      existingBuild,
      ...missing.map((description, index) => ({
        id: idFor(description),
        description,
        position: 2 + index,
      })),
    ])
  })

  it("writes the same result when clicked twice in a row, instead of duplicating", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    // subtasks prop stays the same across both clicks, simulating a second
    // click landing before the first click's write has synced back down.
    renderWithContext(undefined, storageContext)

    const button = screen.getByRole("button", { name: "Add standard checklist" })
    await user.click(button)
    await user.click(button)

    const setSubtasks = storageContext.setSubtasks as jest.Mock
    expect(setSubtasks).toHaveBeenCalledTimes(2)
    expect(setSubtasks.mock.calls[0]).toEqual(setSubtasks.mock.calls[1])
  })

  it("isn't rendered once every standard item already exists", () => {
    const subtasks = Object.fromEntries(
      STANDARD_CHECKLIST.map((description, index) => [
        `id-${index}`,
        { id: `id-${index}`, description, position: index },
      ]),
    )
    renderWithContext(subtasks)

    expect(
      screen.queryByRole("button", { name: "Add standard checklist" }),
    ).not.toBeInTheDocument()
  })
})
