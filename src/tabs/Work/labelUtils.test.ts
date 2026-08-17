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
  labels: [{ value: "a11y", colour: "blue" }],
}

describe("addSourceListLabel", () => {
  it("adds the source list's label to the item, without duplicating it or losing other labels", () => {
    expect(addSourceListLabel(baseTask, labelledList).labels).toEqual([
      { value: "a11y", colour: "blue" },
    ])

    const taskWithSameLabel = {
      ...baseTask,
      labels: [{ value: "a11y", colour: "blue" as const }],
    }
    expect(
      addSourceListLabel(taskWithSameLabel, labelledList).labels,
    ).toEqual([{ value: "a11y", colour: "blue" }])

    const taskWithOtherLabel = {
      ...baseTask,
      labels: [{ value: "urgent", colour: "red" as const }],
    }
    expect(
      addSourceListLabel(taskWithOtherLabel, labelledList).labels,
    ).toEqual([
      { value: "urgent", colour: "red" },
      { value: "a11y", colour: "blue" },
    ])
  })

  it("leaves the item unchanged when the source list has no label", () => {
    const unlabelledList = { ...labelledList, labels: undefined }

    const result = addSourceListLabel(baseTask, unlabelledList)

    expect(result).toBe(baseTask)
  })
})
