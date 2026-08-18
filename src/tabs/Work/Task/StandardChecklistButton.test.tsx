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
  it("adds all the standard checklist items when there are no existing subtasks", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    renderWithContext(undefined, storageContext)

    await user.click(
      screen.getByRole("button", { name: "Add standard checklist" }),
    )

    expect(storageContext.addSubtask).toHaveBeenCalledTimes(
      STANDARD_CHECKLIST.length,
    )
    STANDARD_CHECKLIST.forEach((description) => {
      expect(storageContext.addSubtask).toHaveBeenCalledWith(
        "list-1",
        "task-1",
        description,
        idFor(description),
      )
    })
  })

  it("skips items that already exist, case-insensitively", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    renderWithContext(
      {
        a: { id: "a", description: "Test" },
        b: { id: "b", description: "build" },
      },
      storageContext,
    )

    await user.click(
      screen.getByRole("button", { name: "Add standard checklist" }),
    )

    expect(storageContext.addSubtask).toHaveBeenCalledTimes(
      STANDARD_CHECKLIST.length - 2,
    )
    expect(storageContext.addSubtask).not.toHaveBeenCalledWith(
      "list-1",
      "task-1",
      "test",
      expect.anything(),
    )
    expect(storageContext.addSubtask).not.toHaveBeenCalledWith(
      "list-1",
      "task-1",
      "build",
      expect.anything(),
    )
  })

  it("writes the same deterministic id when clicked twice in a row, instead of duplicating", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    // subtasks prop stays the same across both clicks, simulating a second
    // click landing before the first click's writes have synced back down.
    renderWithContext(undefined, storageContext)

    const button = screen.getByRole("button", { name: "Add standard checklist" })
    await user.click(button)
    await user.click(button)

    const addSubtask = storageContext.addSubtask as jest.Mock
    const idsWritten = addSubtask.mock.calls.map((call) => call[3])
    const uniqueIds = new Set(idsWritten)
    expect(uniqueIds.size).toBe(STANDARD_CHECKLIST.length)
    expect(idsWritten.length).toBe(STANDARD_CHECKLIST.length * 2)
  })

  it("isn't rendered once every standard item already exists", () => {
    const subtasks = Object.fromEntries(
      STANDARD_CHECKLIST.map((description, index) => [
        `id-${index}`,
        { id: `id-${index}`, description },
      ]),
    )
    renderWithContext(subtasks)

    expect(
      screen.queryByRole("button", { name: "Add standard checklist" }),
    ).not.toBeInTheDocument()
  })
})
