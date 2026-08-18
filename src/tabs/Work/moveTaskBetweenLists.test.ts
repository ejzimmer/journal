import { moveTaskBetweenLists } from "./moveTaskBetweenLists"
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
  labels: [{ value: "a11y", colour: "blue" }],
}

const destinationList: WorkTask = {
  id: "list-2",
  description: "Today",
  status: "not_started",
  parentId: "work",
  lastStatusUpdate: 0,
  position: 1,
}

describe("moveTaskBetweenLists", () => {
  it("adds the task to the destination list and removes it from the source list", () => {
    const storage = { addTask: jest.fn(), deleteTask: jest.fn() }

    moveTaskBetweenLists(storage, task, sourceList.id, sourceList, destinationList)

    expect(storage.addTask).toHaveBeenCalledWith(
      "list-2",
      expect.objectContaining({ id: "task-1", position: 0 }),
    )
    expect(storage.deleteTask).toHaveBeenCalledWith("list-1", task)
  })

  it("adds the source list's label to the moved task", () => {
    const storage = { addTask: jest.fn(), deleteTask: jest.fn() }

    moveTaskBetweenLists(storage, task, sourceList.id, sourceList, destinationList)

    expect(storage.addTask).toHaveBeenCalledWith(
      "list-2",
      expect.objectContaining({ labels: [{ value: "a11y", colour: "blue" }] }),
    )
  })

  it("places the task after the highest positioned item in the destination list", () => {
    const storage = { addTask: jest.fn(), deleteTask: jest.fn() }
    const destinationWithItems: WorkTask = {
      ...destinationList,
      items: {
        "existing-1": { ...task, id: "existing-1", position: 3 },
      },
    }

    moveTaskBetweenLists(
      storage,
      task,
      sourceList.id,
      sourceList,
      destinationWithItems,
    )

    expect(storage.addTask).toHaveBeenCalledWith(
      "list-2",
      expect.objectContaining({ position: 3 }),
    )
  })
})
