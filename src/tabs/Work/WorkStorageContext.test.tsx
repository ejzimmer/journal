import { useContext } from "react"
import { render, screen } from "@testing-library/react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import {
  WorkStorageContext,
  WorkStorageContextType,
  WorkStorageProvider,
} from "./WorkStorageContext"
import { LABELS_KEY, StoredLabel, WorkTask } from "./types"

const task: WorkTask = {
  id: "task-1",
  description: "Fix contrast",
  status: "not_started",
  parentId: "work/list-1/items",
  lastStatusUpdate: 0,
  position: 0,
}

const list: WorkTask = {
  id: "list-1",
  description: "Backlog",
  status: "not_started",
  parentId: "work",
  lastStatusUpdate: 0,
  position: 0,
  items: { [task.id]: task },
}

function createFirebaseContext(
  lists: Record<string, WorkTask> | undefined,
  storedLabels: Record<string, StoredLabel> | undefined = {},
) {
  return {
    addItem: jest.fn(() => "new-id"),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    updateList: jest.fn(),
    useValue: <T,>(key?: string) => {
      if (key === LABELS_KEY) {
        return {
          value: storedLabels as unknown as T | undefined,
          loading: storedLabels === undefined,
        }
      }
      return {
        value: lists as unknown as T | undefined,
        loading: lists === undefined,
      }
    },
  }
}

function Probe({
  onReady,
}: {
  onReady: (context: WorkStorageContextType | undefined) => void
}) {
  const context = useContext(WorkStorageContext)
  onReady(context)
  return null
}

function getWorkStorage(
  firebaseContext: ReturnType<typeof createFirebaseContext>,
) {
  let captured: WorkStorageContextType | undefined
  render(
    <FirebaseContext.Provider value={firebaseContext}>
      <WorkStorageProvider>
        <Probe onReady={(context) => (captured = context)} />
      </WorkStorageProvider>
    </FirebaseContext.Provider>,
  )
  return captured
}

describe("WorkStorageContext", () => {
  it("exposes lists and loading state from the firebase context", () => {
    const firebaseContext = createFirebaseContext({ [list.id]: list })
    const workStorage = getWorkStorage(firebaseContext)

    expect(workStorage?.lists).toEqual({ [list.id]: list })
    expect(workStorage?.isLoading).toBe(false)
  })

  it("addList writes a new list under the work key", () => {
    const firebaseContext = createFirebaseContext({})
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addList("Backlog", { value: "a11y", colour: "blue" })

    expect(firebaseContext.addItem).toHaveBeenCalledWith("work", {
      description: "Backlog",
      labelIds: ["new-id"],
    })
  })

  it("addList omits labelIds when none are given", () => {
    const firebaseContext = createFirebaseContext({})
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addList("Backlog")

    expect(firebaseContext.addItem).toHaveBeenCalledWith("work", {
      description: "Backlog",
    })
  })

  it("updateList writes the list back to the work key", () => {
    const firebaseContext = createFirebaseContext({ [list.id]: list })
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.updateList({ ...list, description: "Renamed" })

    expect(firebaseContext.updateItem).toHaveBeenCalledWith("work", {
      ...list,
      description: "Renamed",
    })
  })

  it("deleteList removes the list from the work key", () => {
    const firebaseContext = createFirebaseContext({ [list.id]: list })
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.deleteList(list)

    expect(firebaseContext.deleteItem).toHaveBeenCalledWith("work", list)
  })

  it("reorderLists writes the full ordered list back to the work key", () => {
    const firebaseContext = createFirebaseContext({ [list.id]: list })
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.reorderLists([list])

    expect(firebaseContext.updateList).toHaveBeenCalledWith("work", [list])
  })

  it("addTask writes a new task under the list's items", () => {
    const firebaseContext = createFirebaseContext({ [list.id]: list })
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addTask(list.id, { description: "New task" })

    expect(firebaseContext.addItem).toHaveBeenCalledWith("work/list-1/items", {
      description: "New task",
    })
  })

  it("updateTask writes the task back to the list's items", () => {
    const firebaseContext = createFirebaseContext({ [list.id]: list })
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.updateTask(list.id, { ...task, description: "Updated" })

    expect(firebaseContext.updateItem).toHaveBeenCalledWith(
      "work/list-1/items",
      { ...task, description: "Updated" },
    )
  })

  it("deleteTask removes the task from the list's items", () => {
    const firebaseContext = createFirebaseContext({ [list.id]: list })
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.deleteTask(list.id, task)

    expect(firebaseContext.deleteItem).toHaveBeenCalledWith(
      "work/list-1/items",
      task,
    )
  })

  it("reorderTasks writes the full ordered task list back to the list's items", () => {
    const firebaseContext = createFirebaseContext({ [list.id]: list })
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.reorderTasks(list.id, [task])

    expect(firebaseContext.updateList).toHaveBeenCalledWith(
      "work/list-1/items",
      [task],
    )
  })

  it("addSubtask writes a new subtask under the task", () => {
    const firebaseContext = createFirebaseContext({ [list.id]: list })
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addSubtask(list.id, task.id, "Write tests")

    expect(firebaseContext.addItem).toHaveBeenCalledWith(
      "work/list-1/items/task-1/subtasks",
      { description: "Write tests" },
    )
  })

  it("deleteSubtask removes the subtask from the task", () => {
    const firebaseContext = createFirebaseContext({ [list.id]: list })
    const workStorage = getWorkStorage(firebaseContext)
    const subtask = { id: "sub-1", description: "Write tests" }

    workStorage?.deleteSubtask(list.id, task.id, subtask)

    expect(firebaseContext.deleteItem).toHaveBeenCalledWith(
      "work/list-1/items/task-1/subtasks",
      subtask,
    )
  })

  it("getList and getTask look up entries from the loaded lists", () => {
    const firebaseContext = createFirebaseContext({ [list.id]: list })
    const workStorage = getWorkStorage(firebaseContext)

    expect(workStorage?.getList(list.id)).toEqual(list)
    expect(workStorage?.getList("missing")).toBeUndefined()
    expect(workStorage?.getTask(list.id, task.id)).toEqual(task)
    expect(workStorage?.getTask(list.id, "missing")).toBeUndefined()
  })

  it("throws when rendered without a FirebaseContext provider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation()

    expect(() =>
      render(
        <WorkStorageProvider>
          <></>
        </WorkStorageProvider>,
      ),
    ).toThrow("Missing Firebase context provider")

    consoleError.mockRestore()
  })
})

describe("WorkStorageContext labels", () => {
  const a11yLabel: StoredLabel = { id: "label-a11y", value: "a11y", colour: "blue" }
  const urgentLabel: StoredLabel = {
    id: "label-urgent",
    value: "urgent",
    colour: "yellow",
  }
  const storedLabels = { [a11yLabel.id]: a11yLabel, [urgentLabel.id]: urgentLabel }

  const makeTask = (
    listId: string,
    overrides: Partial<WorkTask> = {},
  ): WorkTask => ({
    id: "task-1",
    description: "Fix contrast",
    status: "not_started",
    parentId: `work/${listId}/items`,
    lastStatusUpdate: 0,
    position: 0,
    ...overrides,
  })

  const makeList = (id: string, overrides: Partial<WorkTask> = {}): WorkTask => ({
    id,
    description: "List",
    status: "not_started",
    parentId: "work",
    lastStatusUpdate: 0,
    position: 0,
    ...overrides,
  })

  it("returns every stored label, not a value derived from lists or tasks", () => {
    const list = makeList("list-1")
    const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    expect(workStorage?.labels).toEqual([a11yLabel, urgentLabel])
  })

  it("getLabel looks up a stored label by id", () => {
    const list = makeList("list-1")
    const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    expect(workStorage?.getLabel(a11yLabel.id)).toEqual(a11yLabel)
    expect(workStorage?.getLabel("missing")).toBeUndefined()
  })

  describe("addLabel", () => {
    it("creates a new stored label and attaches its id to a task", () => {
      const task = makeTask("list-1")
      const list = makeList("list-1", { items: { [task.id]: task } })
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.addLabel({ value: "blocked", colour: "red" }, task)

      expect(firebaseContext.addItem).toHaveBeenCalledWith(LABELS_KEY, {
        value: "blocked",
        colour: "red",
      })
      expect(firebaseContext.updateItem).toHaveBeenCalledWith(
        "work/list-1/items",
        { ...task, labelIds: ["new-id"] },
      )
    })

    it("reuses an existing stored label with the same value", () => {
      const task = makeTask("list-1")
      const list = makeList("list-1", { items: { [task.id]: task } })
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.addLabel({ value: "urgent", colour: "yellow" }, task)

      expect(firebaseContext.addItem).not.toHaveBeenCalledWith(
        LABELS_KEY,
        expect.anything(),
      )
      expect(firebaseContext.updateItem).toHaveBeenCalledWith(
        "work/list-1/items",
        { ...task, labelIds: [urgentLabel.id] },
      )
    })

    it("revives a pending-removal label when reused", () => {
      const pendingLabel = { ...urgentLabel, lastRemoved: Date.now() }
      const task = makeTask("list-1")
      const list = makeList("list-1", { items: { [task.id]: task } })
      const firebaseContext = createFirebaseContext(
        { [list.id]: list },
        { [a11yLabel.id]: a11yLabel, [pendingLabel.id]: pendingLabel },
      )
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.addLabel({ value: "urgent", colour: "yellow" }, task)

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(
        LABELS_KEY,
        urgentLabel,
      )
    })

    it("attaches a label to a list the same way it does to a task", () => {
      const list = makeList("list-2")
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.addLabel({ value: "blocked", colour: "red" }, list)

      expect(firebaseContext.addItem).toHaveBeenCalledWith(LABELS_KEY, {
        value: "blocked",
        colour: "red",
      })
      expect(firebaseContext.updateItem).toHaveBeenCalledWith("work", {
        ...list,
        labelIds: ["new-id"],
      })
    })
  })

  describe("removeLabel", () => {
    it("removes the id from the entity's labelIds", () => {
      const task = makeTask("list-1", { labelIds: [a11yLabel.id] })
      const list = makeList("list-1", { items: { [task.id]: task } })
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.removeLabel(a11yLabel.id, task)

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(
        "work/list-1/items",
        { ...task, labelIds: [] },
      )
    })

    it("does not mark the label removed while another task or list still uses it", () => {
      const task1 = makeTask("list-1", { labelIds: [a11yLabel.id] })
      const task2 = makeTask("list-1", { id: "task-2", labelIds: [a11yLabel.id] })
      const list = makeList("list-1", {
        items: { [task1.id]: task1, [task2.id]: task2 },
      })
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.removeLabel(a11yLabel.id, task1)

      expect(firebaseContext.updateItem).not.toHaveBeenCalledWith(
        LABELS_KEY,
        expect.objectContaining({ id: a11yLabel.id }),
      )
    })

    it("marks the label lastRemoved once nothing else uses it", () => {
      const task = makeTask("list-1", { labelIds: [urgentLabel.id] })
      const list = makeList("list-1", { items: { [task.id]: task } })
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.removeLabel(urgentLabel.id, task)

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(LABELS_KEY, {
        ...urgentLabel,
        lastRemoved: expect.any(Number),
      })
    })

    it("marks the label removed even though a done task still references it", () => {
      const activeTask = makeTask("list-1", {
        id: "task-active",
        labelIds: [urgentLabel.id],
      })
      const doneTask = makeTask("list-1", {
        id: "task-done",
        status: "done",
        labelIds: [urgentLabel.id],
      })
      const list = makeList("list-1", {
        items: { [activeTask.id]: activeTask, [doneTask.id]: doneTask },
      })
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      // Without excluding done tasks from the usage count, doneTask would
      // still "protect" the label from being marked orphaned here.
      workStorage?.removeLabel(urgentLabel.id, activeTask)

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(LABELS_KEY, {
        ...urgentLabel,
        lastRemoved: expect.any(Number),
      })
    })

    it("removes a list's label the same way it does a task's", () => {
      const list = makeList("list-1", { labelIds: [a11yLabel.id] })
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.removeLabel(a11yLabel.id, list)

      expect(firebaseContext.updateItem).toHaveBeenCalledWith("work", {
        ...list,
        labelIds: [],
      })
      expect(firebaseContext.updateItem).toHaveBeenCalledWith(LABELS_KEY, {
        ...a11yLabel,
        lastRemoved: expect.any(Number),
      })
    })
  })

  it("updateLabel updates the stored label's colour", () => {
    const list = makeList("list-1")
    const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.updateLabel(a11yLabel.id, "green")

    expect(firebaseContext.updateItem).toHaveBeenCalledWith(LABELS_KEY, {
      ...a11yLabel,
      colour: "green",
    })
  })

  it("updateLabel does nothing when the label doesn't exist", () => {
    const list = makeList("list-1")
    const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)
    const callsBeforehand = firebaseContext.updateItem.mock.calls.length

    workStorage?.updateLabel("missing", "green")

    expect(firebaseContext.updateItem.mock.calls.length).toBe(callsBeforehand)
  })

  it("deletes labels whose lastRemoved is more than a week old once the store loads", () => {
    const dayMs = 24 * 60 * 60 * 1000
    const staleLabel: StoredLabel = {
      id: "label-stale",
      value: "stale",
      colour: "purple",
      lastRemoved: Date.now() - 8 * dayMs,
    }
    const recentlyRemovedLabel: StoredLabel = {
      id: "label-recent",
      value: "recent",
      colour: "orange",
      lastRemoved: Date.now() - dayMs,
    }
    const list = makeList("list-1")
    const firebaseContext = createFirebaseContext({ [list.id]: list }, {
      [a11yLabel.id]: a11yLabel,
      [staleLabel.id]: staleLabel,
      [recentlyRemovedLabel.id]: recentlyRemovedLabel,
    })

    getWorkStorage(firebaseContext)

    expect(firebaseContext.deleteItem).toHaveBeenCalledWith(
      LABELS_KEY,
      staleLabel,
    )
    expect(firebaseContext.deleteItem).toHaveBeenCalledTimes(1)
  })

  describe("addList", () => {
    it("creates a label and attaches it when given one that doesn't exist yet", () => {
      const firebaseContext = createFirebaseContext({}, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.addList("Blocked", { value: "blocked", colour: "red" })

      expect(firebaseContext.addItem).toHaveBeenCalledWith(LABELS_KEY, {
        value: "blocked",
        colour: "red",
      })
      expect(firebaseContext.addItem).toHaveBeenCalledWith("work", {
        description: "Blocked",
        labelIds: ["new-id"],
      })
    })

    it("reuses an existing label instead of creating a duplicate", () => {
      const firebaseContext = createFirebaseContext({}, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.addList("Today", { value: "urgent", colour: "yellow" })

      expect(firebaseContext.addItem).not.toHaveBeenCalledWith(
        LABELS_KEY,
        expect.anything(),
      )
      expect(firebaseContext.addItem).toHaveBeenCalledWith("work", {
        description: "Today",
        labelIds: [urgentLabel.id],
      })
    })

    it("revives an existing label that was pending removal", () => {
      const pendingLabel = { ...urgentLabel, lastRemoved: Date.now() }
      const firebaseContext = createFirebaseContext(
        {},
        { [a11yLabel.id]: a11yLabel, [pendingLabel.id]: pendingLabel },
      )
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.addList("Today", { value: "urgent", colour: "yellow" })

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(
        LABELS_KEY,
        urgentLabel,
      )
    })
  })

  describe("deleteList", () => {
    it("marks the list's label unused once nothing else references it", () => {
      const list = makeList("list-1", { labelIds: [urgentLabel.id] })
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.deleteList(list)

      expect(firebaseContext.deleteItem).toHaveBeenCalledWith("work", list)
      expect(firebaseContext.updateItem).toHaveBeenCalledWith(LABELS_KEY, {
        ...urgentLabel,
        lastRemoved: expect.any(Number),
      })
    })

    it("leaves the label alone while another list still references it", () => {
      const list = makeList("list-1", { labelIds: [a11yLabel.id] })
      const otherList = makeList("list-2", { labelIds: [a11yLabel.id] })
      const firebaseContext = createFirebaseContext(
        { [list.id]: list, [otherList.id]: otherList },
        storedLabels,
      )
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.deleteList(list)

      expect(firebaseContext.updateItem).not.toHaveBeenCalledWith(
        LABELS_KEY,
        expect.objectContaining({ id: a11yLabel.id }),
      )
    })
  })

  describe("deleteTask", () => {
    it("marks the task's labels unused once nothing else references them", () => {
      const task = makeTask("list-1", { labelIds: [urgentLabel.id] })
      const list = makeList("list-1", { items: { [task.id]: task } })
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.deleteTask(list.id, task)

      expect(firebaseContext.deleteItem).toHaveBeenCalledWith(
        "work/list-1/items",
        task,
      )
      expect(firebaseContext.updateItem).toHaveBeenCalledWith(LABELS_KEY, {
        ...urgentLabel,
        lastRemoved: expect.any(Number),
      })
    })

    it("leaves labels alone while another task still references them", () => {
      const task1 = makeTask("list-1", { labelIds: [a11yLabel.id] })
      const task2 = makeTask("list-1", { id: "task-2", labelIds: [a11yLabel.id] })
      const list = makeList("list-1", {
        items: { [task1.id]: task1, [task2.id]: task2 },
      })
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.deleteTask(list.id, task1)

      expect(firebaseContext.updateItem).not.toHaveBeenCalledWith(
        LABELS_KEY,
        expect.objectContaining({ id: a11yLabel.id }),
      )
    })
  })

  it("addTask resolves labels the same way addList does", () => {
    const list = makeList("list-2")
    const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addTask(list.id, {
      description: "New task",
      labels: [{ value: "urgent", colour: "yellow" }],
    })

    expect(firebaseContext.addItem).toHaveBeenCalledWith("work/list-2/items", {
      description: "New task",
      labelIds: [urgentLabel.id],
    })
  })

  it("addTask and addList do not touch the label store when given no labels", () => {
    const list = makeList("list-2")
    const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addTask(list.id, { description: "New task" })
    workStorage?.addList("New list")

    expect(firebaseContext.addItem).not.toHaveBeenCalledWith(
      LABELS_KEY,
      expect.anything(),
    )
  })

  describe("updateTask label handling", () => {
    it("marks a task's labels orphaned once it becomes done", () => {
      const task = makeTask("list-2", { labelIds: [urgentLabel.id] })
      const list = makeList("list-2", { items: { [task.id]: task } })
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.updateTask(list.id, { ...task, status: "done" })

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(LABELS_KEY, {
        ...urgentLabel,
        lastRemoved: expect.any(Number),
      })
    })

    it("revives a task's labels when it moves back off done", () => {
      const pendingLabel = { ...urgentLabel, lastRemoved: Date.now() }
      const doneTask = makeTask("list-2", {
        status: "done",
        labelIds: [pendingLabel.id],
      })
      const list = makeList("list-2", { items: { [doneTask.id]: doneTask } })
      const firebaseContext = createFirebaseContext(
        { [list.id]: list },
        { [a11yLabel.id]: a11yLabel, [pendingLabel.id]: pendingLabel },
      )
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.updateTask(list.id, { ...doneTask, status: "not_started" })

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(
        LABELS_KEY,
        urgentLabel,
      )
    })

    it("leaves labels alone when neither status nor labels change", () => {
      const task = makeTask("list-1", { labelIds: [a11yLabel.id] })
      const list = makeList("list-1", { items: { [task.id]: task } })
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.updateTask(list.id, { ...task, description: "Updated" })

      expect(firebaseContext.updateItem).not.toHaveBeenCalledWith(
        LABELS_KEY,
        expect.objectContaining({ id: a11yLabel.id }),
      )
    })

    it("marks a label unused when it's dropped from the task's labelIds", () => {
      const task = makeTask("list-1", { labelIds: [urgentLabel.id] })
      const list = makeList("list-1", { items: { [task.id]: task } })
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.updateTask(list.id, { ...task, labelIds: [] })

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(LABELS_KEY, {
        ...urgentLabel,
        lastRemoved: expect.any(Number),
      })
    })

    it("revives a label when it's added back to the task's labelIds", () => {
      const pendingLabel = { ...urgentLabel, lastRemoved: Date.now() }
      const task = makeTask("list-1")
      const list = makeList("list-1", { items: { [task.id]: task } })
      const firebaseContext = createFirebaseContext(
        { [list.id]: list },
        { [a11yLabel.id]: a11yLabel, [pendingLabel.id]: pendingLabel },
      )
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.updateTask(list.id, { ...task, labelIds: [pendingLabel.id] })

      expect(firebaseContext.updateItem).toHaveBeenCalledWith(
        LABELS_KEY,
        urgentLabel,
      )
    })

    it("does not mark a label unused when it's dropped from one task but another still uses it", () => {
      const task1 = makeTask("list-1", { labelIds: [a11yLabel.id] })
      const task2 = makeTask("list-1", { id: "task-2", labelIds: [a11yLabel.id] })
      const list = makeList("list-1", {
        items: { [task1.id]: task1, [task2.id]: task2 },
      })
      const firebaseContext = createFirebaseContext({ [list.id]: list }, storedLabels)
      const workStorage = getWorkStorage(firebaseContext)

      workStorage?.updateTask(list.id, { ...task1, labelIds: [] })

      expect(firebaseContext.updateItem).not.toHaveBeenCalledWith(
        LABELS_KEY,
        expect.objectContaining({ id: a11yLabel.id }),
      )
    })
  })
})

describe("Work storage screen render smoke test", () => {
  it("renders children once lists have loaded", () => {
    const firebaseContext = createFirebaseContext({ [list.id]: list })
    render(
      <FirebaseContext.Provider value={firebaseContext}>
        <WorkStorageProvider>
          <div>ready</div>
        </WorkStorageProvider>
      </FirebaseContext.Provider>,
    )

    expect(screen.getByText("ready")).toBeInTheDocument()
  })
})
