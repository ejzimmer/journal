import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StandardChecklistButton } from "./StandardChecklistButton"
import { WorkStorageContextType } from "../WorkStorageContext"
import { renderWithWorkStorage } from "../workStorageTestUtils"
import { STANDARD_CHECKLIST, Subtask, WorkTask } from "../types"

function renderWithContext(
  subtasks?: Record<string, Subtask>,
  overrides: Partial<WorkStorageContextType> = {},
) {
  const { storageContext } = renderWithWorkStorage(
    <StandardChecklistButton listId="list-1" taskId="task-1" />,
    { getTask: () => ({ subtasks }) as WorkTask, ...overrides },
  )
  return storageContext
}

const standardEntries = [...STANDARD_CHECKLIST.entries()]

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
      standardEntries.map(([id, description], index) => ({
        id,
        description,
        position: index,
      })),
    )
  })

  it("skips items whose standard id already exists, and appends the missing ones in declared order", async () => {
    const user = userEvent.setup()
    const [testEntry, , , , buildEntry] = standardEntries
    const existingTest = { id: testEntry[0], description: testEntry[1], position: 0 }
    const existingBuild = { id: buildEntry[0], description: buildEntry[1], position: 1 }
    const storageContext = renderWithContext({ a: existingTest, b: existingBuild })

    await user.click(
      screen.getByRole("button", { name: "Add standard checklist" }),
    )

    const missing = standardEntries.filter(
      ([id]) => id !== testEntry[0] && id !== buildEntry[0],
    )
    expect(storageContext.updateSubtasksList).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      [
        existingTest,
        existingBuild,
        ...missing.map(([id, description], index) => ({
          id,
          description,
          position: 2 + index,
        })),
      ],
    )
  })

  it("adds a standard item again, with its standard id, even if a custom subtask already has the same description", async () => {
    const user = userEvent.setup()
    const [testEntry] = standardEntries
    const custom = { id: "custom-1", description: testEntry[1], position: 0 }
    const storageContext = renderWithContext({ a: custom })

    await user.click(
      screen.getByRole("button", { name: "Add standard checklist" }),
    )

    expect(storageContext.updateSubtasksList).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      [
        custom,
        ...standardEntries.map(([id, description], index) => ({
          id,
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
      standardEntries.map(([id, description]) => [
        id,
        { id, description, position: 0 },
      ]),
    )
    renderWithContext(subtasks)

    expect(
      screen.queryByRole("button", { name: "Add standard checklist" }),
    ).not.toBeInTheDocument()
  })
})
