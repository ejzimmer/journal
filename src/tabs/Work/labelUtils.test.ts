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
  it("adds the source list's label to the item", () => {
    const result = addSourceListLabel(baseTask, labelledList)

    expect(result.labels).toEqual([{ value: "a11y", colour: "blue" }])
  })

  it("doesn't duplicate a label the item already has", () => {
    const taskWithLabel = {
      ...baseTask,
      labels: [{ value: "a11y", colour: "blue" as const }],
    }

    const result = addSourceListLabel(taskWithLabel, labelledList)

    expect(result.labels).toEqual([{ value: "a11y", colour: "blue" }])
  })

  it("keeps the item's other labels", () => {
    const taskWithLabel = {
      ...baseTask,
      labels: [{ value: "urgent", colour: "red" as const }],
    }

    const result = addSourceListLabel(taskWithLabel, labelledList)

    expect(result.labels).toEqual([
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
