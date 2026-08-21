import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StandardChecklistButton } from "./StandardChecklistButton"
import { WorkStorageContext, WorkStorageContextType } from "../WorkStorageContext"
import { createWorkStorageContext } from "../workStorageTestUtils"
import { STANDARD_CHECKLIST, Subtask, WorkTask } from "../types"

function renderWithContext(
  subtasks?: Record<string, Subtask>,
  overrides: Partial<WorkStorageContextType> = {},
) {
  const storageContext = createWorkStorageContext({
    getTask: () => ({ subtasks }) as WorkTask,
    ...overrides,
  })
  render(
    <WorkStorageContext.Provider value={storageContext}>
      <StandardChecklistButton listId="list-1" taskId="task-1" />
    </WorkStorageContext.Provider>,
  )
  return storageContext
}

const idFor = (description: string) =>
  `standard-${description.toLowerCase().replace(/\s+/g, "-")}`

describe("StandardChecklistButton", () => {
  it("adds all the standard checklist items, in the declared order, when there are no existing subtasks", async () => {
    const user = userEvent.setup()
    const storageContext = renderWithContext(undefined)

    await user.click(
      screen.getByRole("button", { name: "Add standard checklist" }),
    )

    expect(storageContext.updateSubtasksList).toHaveBeenCalledTimes(1)
    expect(storageContext.updateSubtasksList).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      STANDARD_CHECKLIST.map((description, index) => ({
        id: idFor(description),
        description,
        position: index,
      })),
    )
  })

  it("skips items whose standard id already exists, and appends the missing ones in declared order", async () => {
    const user = userEvent.setup()
    const existingTest = { id: idFor("test"), description: "test", position: 0 }
    const existingBuild = { id: idFor("build"), description: "build", position: 1 }
    const storageContext = renderWithContext({ a: existingTest, b: existingBuild })

    await user.click(
      screen.getByRole("button", { name: "Add standard checklist" }),
    )

    const missing = STANDARD_CHECKLIST.filter(
      (description) => !["test", "build"].includes(description.toLowerCase()),
    )
    expect(storageContext.updateSubtasksList).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      [
        existingTest,
        existingBuild,
        ...missing.map((description, index) => ({
          id: idFor(description),
          description,
          position: 2 + index,
        })),
      ],
    )
  })

  it("adds a standard item again, with its standard id, even if a custom subtask already has the same description", async () => {
    const user = userEvent.setup()
    const custom = { id: "custom-1", description: "test", position: 0 }
    const storageContext = renderWithContext({ a: custom })

    await user.click(
      screen.getByRole("button", { name: "Add standard checklist" }),
    )

    expect(storageContext.updateSubtasksList).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      [
        custom,
        ...STANDARD_CHECKLIST.map((description, index) => ({
          id: idFor(description),
          description,
          position: 1 + index,
        })),
      ],
    )
  })

  it("writes the same result when clicked twice in a row, instead of duplicating", async () => {
    const user = userEvent.setup()
    // subtasks stays the same across both clicks, simulating a second click
    // landing before the first click's write has synced back down.
    const storageContext = renderWithContext(undefined)

    const button = screen.getByRole("button", { name: "Add standard checklist" })
    await user.click(button)
    await user.click(button)

    const updateSubtasksList = storageContext.updateSubtasksList as jest.Mock
    expect(updateSubtasksList).toHaveBeenCalledTimes(2)
    expect(updateSubtasksList.mock.calls[0]).toEqual(updateSubtasksList.mock.calls[1])
  })

  it("isn't rendered once every standard item already exists", () => {
    const subtasks = Object.fromEntries(
      STANDARD_CHECKLIST.map((description) => [
        idFor(description),
        { id: idFor(description), description, position: 0 },
      ]),
    )
    renderWithContext(subtasks)

    expect(
      screen.queryByRole("button", { name: "Add standard checklist" }),
    ).not.toBeInTheDocument()
  })
})
