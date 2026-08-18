import { migrateLegacyLabels } from "./migrateLegacyLabels"
import { WorkTask, StoredLabel } from "./types"

function createStorageContext(nextId = "new-label-id") {
  return {
    addItem: jest.fn(() => nextId),
    updateItem: jest.fn(),
  }
}

const legacyTask: WorkTask & { labels?: { value: string; colour: string }[] } =
  {
    id: "task-1",
    description: "Do the thing",
    status: "not_started",
    parentId: "work/list-1/items",
    lastStatusUpdate: 0,
    position: 0,
    labels: [{ value: "a11y", colour: "blue" }],
  }

const migratedTask: WorkTask = {
  id: "task-2",
  description: "Already migrated",
  status: "not_started",
  parentId: "work/list-1/items",
  lastStatusUpdate: 0,
  position: 1,
  labelIds: ["label-existing"],
}

const list: WorkTask & { labels?: { value: string; colour: string }[] } = {
  id: "list-1",
  description: "Backlog",
  status: "not_started",
  parentId: "work",
  lastStatusUpdate: 0,
  position: 0,
  items: { [legacyTask.id]: legacyTask, [migratedTask.id]: migratedTask },
}

describe("migrateLegacyLabels", () => {
  it("reuses an existing label with the same value instead of creating a duplicate", () => {
    const storageContext = createStorageContext()
    const existingLabels: StoredLabel[] = [
      { id: "label-a11y", value: "a11y", colour: "blue" },
    ]

    migrateLegacyLabels({ [list.id]: list }, existingLabels, storageContext)

    expect(storageContext.addItem).not.toHaveBeenCalled()
    expect(storageContext.updateItem).toHaveBeenCalledWith(
      "work/list-1/items",
      {
        id: "task-1",
        description: "Do the thing",
        status: "not_started",
        parentId: "work/list-1/items",
        lastStatusUpdate: 0,
        position: 0,
        labelIds: ["label-a11y"],
      },
    )
  })

  it("creates a new label when no matching value exists yet", () => {
    const storageContext = createStorageContext("label-new")

    migrateLegacyLabels({ [list.id]: list }, [], storageContext)

    expect(storageContext.addItem).toHaveBeenCalledWith("work-labels", {
      value: "a11y",
      colour: "blue",
    })
    expect(storageContext.updateItem).toHaveBeenCalledWith(
      "work/list-1/items",
      expect.objectContaining({ labelIds: ["label-new"] }),
    )
  })

  it("only creates each distinct legacy label once, across multiple tasks", () => {
    const storageContext = createStorageContext("label-new")
    const secondTask = {
      ...legacyTask,
      id: "task-3",
      labels: [{ value: "a11y", colour: "blue" as const }],
    }
    const listWithTwoLegacyTasks = {
      ...list,
      items: { [legacyTask.id]: legacyTask, [secondTask.id]: secondTask },
    }

    migrateLegacyLabels(
      { [list.id]: listWithTwoLegacyTasks },
      [],
      storageContext,
    )

    expect(storageContext.addItem).toHaveBeenCalledTimes(1)
  })

  it("leaves tasks that already use labelIds untouched", () => {
    const storageContext = createStorageContext()

    migrateLegacyLabels({ [list.id]: list }, [], storageContext)

    expect(storageContext.updateItem).not.toHaveBeenCalledWith(
      "work/list-1/items",
      expect.objectContaining({ id: "task-2" }),
    )
  })

  it("migrates a legacy label on a list itself, not just its tasks", () => {
    const storageContext = createStorageContext("label-list")
    const legacyList = {
      ...list,
      items: undefined,
      labels: [{ value: "urgent", colour: "red" }],
    }

    migrateLegacyLabels({ [legacyList.id]: legacyList }, [], storageContext)

    expect(storageContext.updateItem).toHaveBeenCalledWith(
      "work",
      expect.objectContaining({ labelIds: ["label-list"] }),
    )
  })
})
