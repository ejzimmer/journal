import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Task } from "./Task"
import {
  WorkStorageContext,
  WorkStorageContextType,
} from "../WorkStorageContext"
import { createWorkStorageContext } from "../workStorageTestUtils"
import { WorkTask } from "../types"

const list: WorkTask = {
  id: "list-1",
  description: "Backlog",
  status: "not_started",
  parentId: "work",
  lastStatusUpdate: 0,
  position: 0,
}

const task: WorkTask = {
  id: "task-1",
  description: "Fix contrast",
  status: "not_started",
  parentId: "list-1/items",
  lastStatusUpdate: 0,
  position: 0,
  labelIds: ["label-a11y", "label-urgent"],
}

function renderTask(
  task: WorkTask,
  storageContext: WorkStorageContextType,
) {
  return render(
    <WorkStorageContext.Provider value={storageContext}>
      <Task task={task} listId={list.id} dragHandle={<></>} />
    </WorkStorageContext.Provider>,
  )
}

describe("Task checkbox", () => {
  it("marks every attached label as potentially orphaned when checked done", async () => {
    const user = userEvent.setup()
    const storageContext = createWorkStorageContext({
      getList: (id) => (id === list.id ? list : undefined),
    })
    renderTask(task, storageContext)

    await user.click(screen.getByRole("checkbox", { name: "Fix contrast" }))

    expect(storageContext.updateTask).toHaveBeenCalledWith(
      list.id,
      expect.objectContaining({ status: "done" }),
    )
    expect(storageContext.markLabelUnusedIfOrphaned).toHaveBeenCalledWith(
      "label-a11y",
    )
    expect(storageContext.markLabelUnusedIfOrphaned).toHaveBeenCalledWith(
      "label-urgent",
    )
    expect(storageContext.reviveLabel).not.toHaveBeenCalled()
  })

  it("revives every attached label when unchecked back to active", async () => {
    const user = userEvent.setup()
    const doneTask: WorkTask = { ...task, status: "done" }
    const storageContext = createWorkStorageContext({
      getList: (id) => (id === list.id ? list : undefined),
    })
    renderTask(doneTask, storageContext)

    await user.click(screen.getByRole("checkbox", { name: "Fix contrast" }))

    expect(storageContext.updateTask).toHaveBeenCalledWith(
      list.id,
      expect.objectContaining({ status: "not_started" }),
    )
    expect(storageContext.reviveLabel).toHaveBeenCalledWith("label-a11y")
    expect(storageContext.reviveLabel).toHaveBeenCalledWith("label-urgent")
    expect(storageContext.markLabelUnusedIfOrphaned).not.toHaveBeenCalled()
  })

  it("does nothing label-related when the task has no labels", async () => {
    const user = userEvent.setup()
    const unlabelledTask: WorkTask = { ...task, labelIds: undefined }
    const storageContext = createWorkStorageContext({
      getList: (id) => (id === list.id ? list : undefined),
    })
    renderTask(unlabelledTask, storageContext)

    await user.click(screen.getByRole("checkbox", { name: "Fix contrast" }))

    expect(storageContext.markLabelUnusedIfOrphaned).not.toHaveBeenCalled()
    expect(storageContext.reviveLabel).not.toHaveBeenCalled()
  })
})
