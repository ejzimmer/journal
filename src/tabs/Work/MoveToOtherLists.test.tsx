import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MoveToOtherLists } from "./MoveToOtherLists"
import { WorkStorageContext } from "./WorkStorageContext"
import { createWorkStorageContext } from "./workStorageTestUtils"
import { WorkTask } from "./types"

const task: WorkTask = {
  id: "task-1",
  description: "Fix contrast",
  status: "not_started",
  parentId: "list-1",
  lastStatusUpdate: 0,
  position: 0,
}

const sourceList: WorkTask = {
  id: "list-1",
  description: "a11y backlog",
  status: "not_started",
  parentId: "work",
  lastStatusUpdate: 0,
  position: 0,
  labelIds: ["label-a11y"],
}

const destinationList: WorkTask = {
  id: "list-2",
  description: "Today",
  status: "not_started",
  parentId: "work",
  lastStatusUpdate: 0,
  position: 1,
}

describe("MoveToOtherLists", () => {
  it("adds the source list's label to the task when moved", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext()
    render(
      <WorkStorageContext.Provider value={storageContext}>
        <MoveToOtherLists
          allLists={[sourceList, destinationList]}
          currentListId={sourceList.id}
          task={task}
        />
      </WorkStorageContext.Provider>,
    )

    await user.click(screen.getByRole("menuitem", { name: "Today" }))

    expect(storageContext.addTask).toHaveBeenCalledWith(
      "list-2",
      expect.objectContaining({
        labelIds: ["label-a11y"],
      }),
    )
    expect(storageContext.deleteTask).toHaveBeenCalledWith("list-1", task)
  })
})
