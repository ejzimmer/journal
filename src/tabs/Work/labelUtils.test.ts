import { addSourceListLabel, getNextColour } from "./labelUtils"
import { COLOURS, WorkTask } from "./types"

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

describe("getNextColour", () => {
  describe("when there are no existing options", () => {
    it("returns the first colour in the list", () => {
      const nextColour = getNextColour([])

      expect(nextColour).toBe(COLOURS[0])
    })
  })

  describe("when some colours have been used", () => {
    it("returns the first unused colour", () => {
      let nextColour = getNextColour([COLOURS[5]])
      expect(nextColour).toBe(COLOURS[0])

      nextColour = getNextColour([COLOURS[0], COLOURS[1], COLOURS[4]])
      expect(nextColour).toBe(COLOURS[2])
    })
  })

  describe("when all the colours have been used at least once", () => {
    it("returns the first colour used the least number of times", () => {
      let nextColour = getNextColour([...COLOURS])
      expect(nextColour).toBe(COLOURS[0])

      nextColour = getNextColour([
        ...COLOURS,
        COLOURS[0],
        COLOURS[1],
        COLOURS[4],
      ])
      expect(nextColour).toBe(COLOURS[2])

      nextColour = getNextColour([
        ...COLOURS,
        ...COLOURS,
        COLOURS[1],
        COLOURS[2],
        COLOURS[5],
        COLOURS[0],
        COLOURS[0],
      ])
      expect(nextColour).toBe(COLOURS[3])
    })
  })
})
