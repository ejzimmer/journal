import { cleanupDoneOnlyLabels } from "./cleanupDoneOnlyLabels"
import { StoredLabel, WorkTask } from "./types"

function createDeps() {
  return { updateItem: jest.fn() }
}

const doneOnlyLabel: StoredLabel = {
  id: "label-done-only",
  value: "done-only",
  colour: "blue",
}
const activeLabel: StoredLabel = {
  id: "label-active",
  value: "active",
  colour: "yellow",
}
const alreadyPendingLabel: StoredLabel = {
  id: "label-pending",
  value: "pending",
  colour: "purple",
  lastRemoved: 12345,
}
const unusedLabel: StoredLabel = {
  id: "label-unused",
  value: "unused",
  colour: "green",
}

const doneTask: WorkTask = {
  id: "task-done",
  description: "Finished thing",
  status: "done",
  parentId: "list-1/items",
  lastStatusUpdate: 0,
  position: 0,
  labelIds: [doneOnlyLabel.id, alreadyPendingLabel.id],
}

const activeTask: WorkTask = {
  id: "task-active",
  description: "Still going",
  status: "not_started",
  parentId: "list-1/items",
  lastStatusUpdate: 0,
  position: 1,
  labelIds: [activeLabel.id],
}

const list: WorkTask = {
  id: "list-1",
  description: "Backlog",
  status: "not_started",
  parentId: "work",
  lastStatusUpdate: 0,
  position: 0,
  items: { [doneTask.id]: doneTask, [activeTask.id]: activeTask },
}

const storedLabels = [
  doneOnlyLabel,
  activeLabel,
  alreadyPendingLabel,
  unusedLabel,
]

describe("cleanupDoneOnlyLabels", () => {
  it("marks a label only referenced by done tasks as pending removal", () => {
    const deps = createDeps()

    cleanupDoneOnlyLabels({ [list.id]: list }, storedLabels, deps)

    expect(deps.updateItem).toHaveBeenCalledWith(
      "work-labels",
      expect.objectContaining({ id: doneOnlyLabel.id, lastRemoved: expect.any(Number) }),
    )
  })

  it("leaves a label referenced by an active task untouched", () => {
    const deps = createDeps()

    cleanupDoneOnlyLabels({ [list.id]: list }, storedLabels, deps)

    expect(deps.updateItem).not.toHaveBeenCalledWith(
      "work-labels",
      expect.objectContaining({ id: activeLabel.id }),
    )
  })

  it("doesn't touch a label that's already marked pending removal", () => {
    const deps = createDeps()

    cleanupDoneOnlyLabels({ [list.id]: list }, storedLabels, deps)

    expect(deps.updateItem).not.toHaveBeenCalledWith(
      "work-labels",
      expect.objectContaining({ id: alreadyPendingLabel.id }),
    )
  })

  it("marks an entirely unused label as pending removal too", () => {
    const deps = createDeps()

    cleanupDoneOnlyLabels({ [list.id]: list }, storedLabels, deps)

    expect(deps.updateItem).toHaveBeenCalledWith(
      "work-labels",
      expect.objectContaining({ id: unusedLabel.id, lastRemoved: expect.any(Number) }),
    )
  })

  it("counts a list's own label as active, even with no tasks", () => {
    const listWithLabel: WorkTask = {
      ...list,
      labelIds: [doneOnlyLabel.id],
      items: { [doneTask.id]: doneTask },
    }
    const deps = createDeps()

    cleanupDoneOnlyLabels({ [listWithLabel.id]: listWithLabel }, storedLabels, deps)

    expect(deps.updateItem).not.toHaveBeenCalledWith(
      "work-labels",
      expect.objectContaining({ id: doneOnlyLabel.id }),
    )
  })
})
