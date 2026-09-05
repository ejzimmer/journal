import { getAppendPosition } from "./taskPosition"
import { WorkTask } from "./types"

const list: WorkTask = {
  id: "list-1",
  description: "Today",
  status: "not_started",
  parentId: "work",
  lastStatusUpdate: 0,
  position: 0,
}

describe("getAppendPosition", () => {
  it("returns 0 for a list with no items", () => {
    expect(getAppendPosition(list)).toBe(0)
  })

  it("returns the highest position already in the list", () => {
    const listWithItems: WorkTask = {
      ...list,
      items: {
        "task-1": {
          id: "task-1",
          description: "Fix contrast",
          status: "not_started",
          parentId: "list-1",
          lastStatusUpdate: 0,
          position: 3,
        },
      },
    }

    expect(getAppendPosition(listWithItems)).toBe(3)
  })
})
