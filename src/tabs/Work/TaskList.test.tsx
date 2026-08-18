import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TaskList } from "./TaskList"
import { WorkStorageContext, WorkStorageContextType } from "./WorkStorageContext"
import { createWorkStorageContext } from "./workStorageTestUtils"
import { WorkTask, StoredLabel } from "./types"

const a11yLabel: StoredLabel = { id: "id-a11y", value: "a11y", colour: "blue" }
const urgentLabel: StoredLabel = {
  id: "id-urgent",
  value: "urgent",
  colour: "yellow",
}

const labelledList: WorkTask = {
  id: "list-1",
  description: "a11y backlog",
  status: "not_started",
  parentId: "work",
  lastStatusUpdate: 0,
  position: 0,
  labelIds: [a11yLabel.id],
}

const unlabelledList: WorkTask = {
  id: "list-2",
  description: "Today",
  status: "not_started",
  parentId: "work",
  lastStatusUpdate: 0,
  position: 1,
}

const lists: Record<string, WorkTask> = {
  [labelledList.id]: labelledList,
  [unlabelledList.id]: unlabelledList,
}

const mockLabels: StoredLabel[] = [a11yLabel, urgentLabel]

const noop = () => <></>

function renderTaskList(
  listId: string,
  storageContext: WorkStorageContextType,
) {
  return render(
    <WorkStorageContext.Provider value={storageContext}>
      <TaskList
        listId={listId}
        index={0}
        parentListId="work"
        additionalMoveDestinations={noop}
      />
    </WorkStorageContext.Provider>,
  )
}

function createStorageContext(): WorkStorageContextType {
  return createWorkStorageContext({
    lists,
    getList: (listId) => lists[listId],
    getTask: (listId, taskId) => lists[listId]?.items?.[taskId],
    labels: mockLabels,
    getLabel: (id) => mockLabels.find((l) => l.id === id),
    resolveLabel: ({ value, colour }) =>
      mockLabels.find((l) => l.value === value)?.id ?? `id-${value}-${colour}`,
  })
}

describe("TaskList label", () => {
  it("shows the label and an edit button when the list has a label", () => {
    renderTaskList(labelledList.id, createStorageContext())

    expect(screen.getByText("a11y")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Change a11y label" }),
    ).toBeInTheDocument()
  })

  it("doesn't show a label or edit button when the list has none", () => {
    renderTaskList(unlabelledList.id, createStorageContext())

    expect(screen.queryByText("a11y")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Change .* label/ }),
    ).not.toBeInTheDocument()
  })

  it("removes the label when its remove button is clicked", async () => {
    const user = userEvent.setup()
    const storageContext = createStorageContext()
    renderTaskList(labelledList.id, storageContext)

    const labelItem = screen.getByText("a11y").closest("li")
    await user.click(within(labelItem!).getByRole("button", { name: "Remove a11y" }))

    expect(storageContext.removeLabelFromList).toHaveBeenCalledWith(
      a11yLabel.id,
      labelledList,
    )
  })

  it("switches to a different label when edited", async () => {
    const user = userEvent.setup()
    const storageContext = createStorageContext()
    renderTaskList(labelledList.id, storageContext)

    await user.click(screen.getByRole("button", { name: "Change a11y label" }))
    await user.click(screen.getByRole("option", { name: "urgent" }))

    expect(storageContext.removeLabelFromList).toHaveBeenCalledWith(
      a11yLabel.id,
      labelledList,
    )
    expect(storageContext.updateList).toHaveBeenCalledWith({
      ...labelledList,
      labelIds: [urgentLabel.id],
    })
  })
})
