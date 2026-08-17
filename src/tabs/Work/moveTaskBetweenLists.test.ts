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

describe("moveTaskBetweenLists", () => {
  it("adds the task to the destination list and removes it from the source list", () => {
    const storageContext = { addItem: jest.fn(), deleteItem: jest.fn() }

    moveTaskBetweenLists(
      storageContext,
      task,
      sourceList.id,
      sourceList,
      destinationList,
    )

    expect(storageContext.addItem).toHaveBeenCalledWith(
      "work/list-2/items",
      expect.objectContaining({ id: "task-1", position: 0 }),
    )
    expect(storageContext.deleteItem).toHaveBeenCalledWith(
      "work/list-1/items",
      task,
    )
  })

  it("adds the source list's label to the moved task", () => {
    const storageContext = { addItem: jest.fn(), deleteItem: jest.fn() }

    moveTaskBetweenLists(
      storageContext,
      task,
      sourceList.id,
      sourceList,
      destinationList,
    )

    expect(storageContext.addItem).toHaveBeenCalledWith(
      "work/list-2/items",
      expect.objectContaining({ labelIds: ["label-a11y"] }),
    )
  })

  it("places the task after the highest positioned item in the destination list", () => {
    const storageContext = { addItem: jest.fn(), deleteItem: jest.fn() }
    const destinationWithItems: WorkTask = {
      ...destinationList,
      items: {
        "existing-1": { ...task, id: "existing-1", position: 3 },
      },
    }

    moveTaskBetweenLists(
      storageContext,
      task,
      sourceList.id,
      sourceList,
      destinationWithItems,
    )

    expect(storageContext.addItem).toHaveBeenCalledWith(
      "work/list-2/items",
      expect.objectContaining({ position: 3 }),
    )
  })
})
