import { addSourceListLabel } from "./labelUtils"
import { WorkTask } from "./types"

const baseTask: WorkTask = {
  id: "task-1",
  description: "Do the thing",
  status: "not_started",
  parentId: "list-1",
  lastStatusUpdate: 0,
  position: 0,
}

const labelledList: WorkTask = {
  id: "list-1",
  description: "a11y",
  status: "not_started",
  parentId: "work",
  lastStatusUpdate: 0,
  position: 0,
  labelIds: ["label-a11y"],
}

describe("addSourceListLabel", () => {
  it("adds the source list's label id to the item, without duplicating it or losing other labels", () => {
    expect(addSourceListLabel(baseTask, labelledList).labelIds).toEqual([
      "label-a11y",
    ])

    const taskWithSameLabel = {
      ...baseTask,
      labelIds: ["label-a11y"],
    }
    expect(
      addSourceListLabel(taskWithSameLabel, labelledList).labelIds,
    ).toEqual(["label-a11y"])

    const taskWithOtherLabel = {
      ...baseTask,
      labelIds: ["label-urgent"],
    }
    expect(
      addSourceListLabel(taskWithOtherLabel, labelledList).labelIds,
    ).toEqual(["label-urgent", "label-a11y"])
  })

  it("leaves the item unchanged when the source list has no label", () => {
    const unlabelledList = { ...labelledList, labelIds: undefined }

    const result = addSourceListLabel(baseTask, unlabelledList)

    expect(result).toBe(baseTask)
  })
})
