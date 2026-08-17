import { useContext } from "react"
import { render, screen } from "@testing-library/react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import {
  WorkStorageContext,
  WorkStorageContextType,
  WorkStorageProvider,
} from "./WorkStorageContext"
import { WorkTask } from "./types"

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

function createFirebaseContext(lists: Record<string, WorkTask> | undefined) {
  return {
    addItem: jest.fn(() => "new-id"),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    updateList: jest.fn(),
    useValue: <T,>() => ({
      value: lists as unknown as T | undefined,
      loading: lists === undefined,
    }),
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
    expect(workStorage?.loading).toBe(false)
  })

  it("addList writes a new list under the work key", () => {
    const firebaseContext = createFirebaseContext({})
    const workStorage = getWorkStorage(firebaseContext)

    workStorage?.addList("Backlog", [{ value: "a11y", colour: "blue" }])

    expect(firebaseContext.addItem).toHaveBeenCalledWith("work", {
      description: "Backlog",
      labels: [{ value: "a11y", colour: "blue" }],
    })
  })

  it("addList omits labels when none are given", () => {
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
