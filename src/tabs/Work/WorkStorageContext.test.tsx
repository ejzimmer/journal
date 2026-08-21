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
  parentId: "list-1/items",
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

    workStorage?.addList("Backlog", [{ value: "a11y", colour: "blue" }])

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

  const labelledTask: WorkTask = { ...task, labelIds: [a11yLabel.id] }
  const secondTask: WorkTask = {
    id: "task-2",
    description: "Fix contrast in dark mode",
    status: "not_started",
    parentId: "list-1/items",
    lastStatusUpdate: 0,
    position: 1,
  }
  const labelledList: WorkTask = {
    ...list,
    labelIds: [a11yLabel.id],
    items: { [labelledTask.id]: labelledTask, [secondTask.id]: secondTask },
  }
  const otherList: WorkTask = {
    id: "list-2",
    description: "Today",
    status: "not_started",
    parentId: "work",
    lastStatusUpdate: 0,
    position: 1,
  }
  const twoLists = {
    [labelledList.id]: labelledList,
    [otherList.id]: otherList,
  }
  const storedLabels = { [a11yLabel.id]: a11yLabel, [urgentLabel.id]: urgentLabel }

  it("returns every stored label, not a value derived from lists or tasks", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    expect(workStorage?.labels).toEqual([a11yLabel, urgentLabel])
  })

  it("getLabel looks up a stored label by id", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    expect(workStorage?.getLabel(a11yLabel.id)).toEqual(a11yLabel)
    expect(workStorage?.getLabel("missing")).toBeUndefined()
  })

  it("addLabelToTask creates a new stored label and attaches its id to the task", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addLabelToTask(
      { value: "blocked", colour: "red" },
      secondTask,
      labelledList,
    )

    expect(firebaseContext.addItem).toHaveBeenCalledWith(LABELS_KEY, {
      value: "blocked",
      colour: "red",
    })
    expect(firebaseContext.updateItem).toHaveBeenCalledWith(
      "work/list-1/items",
      { ...secondTask, labelIds: ["new-id"] },
    )
  })

  it("addLabelToTask reuses an existing stored label with the same value", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addLabelToTask(
      { value: "urgent", colour: "yellow" },
      secondTask,
      labelledList,
    )

    expect(firebaseContext.addItem).not.toHaveBeenCalled()
    expect(firebaseContext.updateItem).toHaveBeenCalledWith(
      "work/list-1/items",
      { ...secondTask, labelIds: [urgentLabel.id] },
    )
  })

  it("addLabelToTask clears lastRemoved when reusing a pending-removal label", () => {
    const pendingLabel = { ...urgentLabel, lastRemoved: Date.now() }
    const firebaseContext = createFirebaseContext(twoLists, {
      [a11yLabel.id]: a11yLabel,
      [pendingLabel.id]: pendingLabel,
    })
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addLabelToTask(
      { value: "urgent", colour: "yellow" },
      secondTask,
      labelledList,
    )

    expect(firebaseContext.updateItem).toHaveBeenCalledWith(
      LABELS_KEY,
      urgentLabel,
    )
  })

  it("removeLabelFromTask removes the id from the task's labelIds", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.removeLabelFromTask(a11yLabel.id, labelledTask, labelledList)

    expect(firebaseContext.updateItem).toHaveBeenCalledWith(
      "work/list-1/items",
      { ...labelledTask, labelIds: [] },
    )
  })

  it("removeLabelFromTask does not mark the label removed while another task or list still uses it", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.removeLabelFromTask(a11yLabel.id, labelledTask, labelledList)

    expect(firebaseContext.updateItem).not.toHaveBeenCalledWith(
      LABELS_KEY,
      expect.objectContaining({ id: a11yLabel.id }),
    )
  })

  it("removeLabelFromTask marks the label lastRemoved once nothing else uses it", () => {
    const onlyUser: WorkTask = { ...secondTask, labelIds: [urgentLabel.id] }
    const listWithOnlyUser: WorkTask = {
      ...otherList,
      items: { [onlyUser.id]: onlyUser },
    }
    const firebaseContext = createFirebaseContext(
      { [listWithOnlyUser.id]: listWithOnlyUser },
      storedLabels,
    )
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.removeLabelFromTask(urgentLabel.id, onlyUser, listWithOnlyUser)

    expect(firebaseContext.updateItem).toHaveBeenCalledWith(LABELS_KEY, {
      ...urgentLabel,
      lastRemoved: expect.any(Number),
    })
  })

  it("addLabelToList creates a new stored label and attaches its id to the list", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addLabelToList({ value: "blocked", colour: "red" }, otherList)

    expect(firebaseContext.addItem).toHaveBeenCalledWith(LABELS_KEY, {
      value: "blocked",
      colour: "red",
    })
    expect(firebaseContext.updateItem).toHaveBeenCalledWith("work", {
      ...otherList,
      labelIds: ["new-id"],
    })
  })

  it("removeLabelFromList removes the id from the list's labelIds", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.removeLabelFromList(a11yLabel.id, labelledList)

    expect(firebaseContext.updateItem).toHaveBeenCalledWith("work", {
      ...labelledList,
      labelIds: [],
    })
    // labelledTask still references a11yLabel, so it isn't orphaned yet
    expect(firebaseContext.updateItem).not.toHaveBeenCalledWith(
      LABELS_KEY,
      expect.objectContaining({ id: a11yLabel.id }),
    )
  })

  it("removeLabelFromList marks the label lastRemoved once nothing else uses it", () => {
    const soloLabelList: WorkTask = { ...otherList, labelIds: [urgentLabel.id] }
    const firebaseContext = createFirebaseContext(
      { [soloLabelList.id]: soloLabelList },
      storedLabels,
    )
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.removeLabelFromList(urgentLabel.id, soloLabelList)

    expect(firebaseContext.updateItem).toHaveBeenCalledWith(LABELS_KEY, {
      ...urgentLabel,
      lastRemoved: expect.any(Number),
    })
  })

  it("updateLabel updates the stored label's colour", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.updateLabel(a11yLabel.id, "green")

    expect(firebaseContext.updateItem).toHaveBeenCalledWith(LABELS_KEY, {
      ...a11yLabel,
      colour: "green",
    })
  })

  it("updateLabel does nothing when the label doesn't exist", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
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
    const firebaseContext = createFirebaseContext(twoLists, {
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

  it("addTask and addList do not touch the label store", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addTask(otherList.id, { description: "New task" })
    workStorage?.addList("New list")

    expect(firebaseContext.addItem).not.toHaveBeenCalledWith(
      LABELS_KEY,
      expect.anything(),
    )
  })

  it("removeLabelFromTask marks the label removed even though a done task still references it", () => {
    const activeUser: WorkTask = {
      ...task,
      id: "task-active",
      labelIds: [urgentLabel.id],
    }
    const doneUser: WorkTask = {
      ...secondTask,
      status: "done",
      labelIds: [urgentLabel.id],
    }
    const listWithBoth: WorkTask = {
      ...otherList,
      items: { [activeUser.id]: activeUser, [doneUser.id]: doneUser },
    }
    const firebaseContext = createFirebaseContext(
      { [listWithBoth.id]: listWithBoth },
      storedLabels,
    )
    const workStorage = getWorkStorage(firebaseContext)

    // Without excluding done tasks from the usage count, doneUser would
    // still "protect" the label from being marked orphaned here.
    workStorage?.removeLabelFromTask(urgentLabel.id, activeUser, listWithBoth)

    expect(firebaseContext.updateItem).toHaveBeenCalledWith(LABELS_KEY, {
      ...urgentLabel,
      lastRemoved: expect.any(Number),
    })
  })

  it("addList creates a label and attaches it when given one that doesn't exist yet", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addList("Blocked", [{ value: "blocked", colour: "red" }])

    expect(firebaseContext.addItem).toHaveBeenCalledWith(LABELS_KEY, {
      value: "blocked",
      colour: "red",
    })
    expect(firebaseContext.addItem).toHaveBeenCalledWith("work", {
      description: "Blocked",
      labelIds: ["new-id"],
    })
  })

  it("addList reuses an existing label instead of creating a duplicate", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addList("Today", [{ value: "urgent", colour: "yellow" }])

    expect(firebaseContext.addItem).not.toHaveBeenCalledWith(
      LABELS_KEY,
      expect.anything(),
    )
    expect(firebaseContext.addItem).toHaveBeenCalledWith("work", {
      description: "Today",
      labelIds: [urgentLabel.id],
    })
  })

  it("addTask resolves labels the same way addList does", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addTask(otherList.id, {
      description: "New task",
      labels: [{ value: "urgent", colour: "yellow" }],
    })

    expect(firebaseContext.addItem).toHaveBeenCalledWith(
      "work/list-2/items",
      { description: "New task", labelIds: [urgentLabel.id] },
    )
  })

  it("updateTask marks a task's labels orphaned once it becomes done, revives them if undone", () => {
    const onlyUser: WorkTask = { ...secondTask, labelIds: [urgentLabel.id] }
    const listWithOnlyUser: WorkTask = {
      ...otherList,
      items: { [onlyUser.id]: onlyUser },
    }
    const firebaseContext = createFirebaseContext(
      { [listWithOnlyUser.id]: listWithOnlyUser },
      storedLabels,
    )
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.updateTask(listWithOnlyUser.id, {
      ...onlyUser,
      status: "done",
    })

    expect(firebaseContext.updateItem).toHaveBeenCalledWith(LABELS_KEY, {
      ...urgentLabel,
      lastRemoved: expect.any(Number),
    })
  })

  it("updateTask revives a task's labels when it moves back off done", () => {
    const pendingLabel = { ...urgentLabel, lastRemoved: Date.now() }
    const doneTask: WorkTask = {
      ...secondTask,
      status: "done",
      labelIds: [pendingLabel.id],
    }
    const listWithDoneTask: WorkTask = {
      ...otherList,
      items: { [doneTask.id]: doneTask },
    }
    const firebaseContext = createFirebaseContext(
      { [listWithDoneTask.id]: listWithDoneTask },
      { [a11yLabel.id]: a11yLabel, [pendingLabel.id]: pendingLabel },
    )
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.updateTask(listWithDoneTask.id, {
      ...doneTask,
      status: "not_started",
    })

    expect(firebaseContext.updateItem).toHaveBeenCalledWith(
      LABELS_KEY,
      urgentLabel,
    )
  })

  it("updateTask leaves labels alone when the status doesn't change", () => {
    const firebaseContext = createFirebaseContext(twoLists, storedLabels)
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.updateTask(labelledList.id, {
      ...labelledTask,
      description: "Updated",
    })

    expect(firebaseContext.updateItem).not.toHaveBeenCalledWith(
      LABELS_KEY,
      expect.objectContaining({ id: a11yLabel.id }),
    )
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
