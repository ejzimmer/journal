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

  it("reuses items that already exist, case-insensitively, keeping the whole standard set in declared order", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    // "build" already exists ahead of "test" - out of declared order - to
    // prove the button corrects the whole standard block, not just the
    // newly added items.
    const existingBuild = { id: "b", description: "build", position: 0 }
    const existingTest = { id: "a", description: "Test", position: 1 }
    renderWithContext(
      { a: existingTest, b: existingBuild },
      storageContext,
    )

    await user.click(
      screen.getByRole("button", { name: "Add standard checklist" }),
    )

    expect(storageContext.setSubtasks).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      STANDARD_CHECKLIST.map((description, index) => {
        if (description.toLowerCase() === "test") {
          return { ...existingTest, position: index }
        }
        if (description.toLowerCase() === "build") {
          return { ...existingBuild, position: index }
        }
        return { id: idFor(description), description, position: index }
      }),
    )
  })

  it("keeps custom subtasks ahead of the standard block", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    const custom = { id: "c", description: "write design doc", position: 0 }
    renderWithContext({ c: custom }, storageContext)

    await user.click(
      screen.getByRole("button", { name: "Add standard checklist" }),
    )

    expect(storageContext.setSubtasks).toHaveBeenCalledWith(
      "list-1",
      "task-1",
      [
        { ...custom, position: 0 },
        ...STANDARD_CHECKLIST.map((description, index) => ({
          id: idFor(description),
          description,
          position: index + 1,
        })),
      ],
    )
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
