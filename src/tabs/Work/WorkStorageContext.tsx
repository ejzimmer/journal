import { createContext, ReactNode, useContext } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Label, Subtask, WorkTask, WORK_KEY } from "./types"

export type WorkStorageContextType = {
  lists?: Record<string, WorkTask>
  loading: boolean

  addList: (listName: string, labels?: Label[]) => void
  updateList: (list: WorkTask) => void
  deleteList: (list: WorkTask) => void
  reorderLists: <T extends { id: string }>(lists: T[]) => void

  addTask: (
    listId: string,
    task: Partial<WorkTask> & { description: string },
  ) => void
  updateTask: (listId: string, task: WorkTask) => void
  deleteTask: (listId: string, task: WorkTask) => void
  reorderTasks: <T extends { id: string }>(listId: string, tasks: T[]) => void

  addSubtask: (listId: string, taskId: string, description: string) => void
  deleteSubtask: (listId: string, taskId: string, subtask: Subtask) => void

  getList: (listId: string) => WorkTask | undefined
  getTask: (listId: string, taskId: string) => WorkTask | undefined
}

export const WorkStorageContext = createContext<
  WorkStorageContextType | undefined
>(undefined)

export function WorkStorageProvider({ children }: { children: ReactNode }) {
  const firebase = useContext(FirebaseContext)
  if (!firebase) {
    throw new Error("Missing Firebase context provider")
  }
  const {
    addItem,
    updateItem,
    deleteItem,
    updateList: updateItemsList,
    useValue,
  } = firebase

  const { value: lists, loading } =
    useValue<Record<string, WorkTask>>(WORK_KEY)

  const value: WorkStorageContextType = {
    lists,
    loading,

    addList: (listName, labels = []) => {
      addItem(WORK_KEY, {
        description: listName,
        ...(labels.length > 0 && { labels }),
      })
    },
    updateList: (list) => {
      updateItem(WORK_KEY, list)
    },
    deleteList: (list) => {
      deleteItem(WORK_KEY, list)
    },
    reorderLists: (reorderedLists) => {
      updateItemsList(WORK_KEY, reorderedLists)
    },

    addTask: (listId, task) => {
      addItem(`${WORK_KEY}/${listId}/items`, task)
    },
    updateTask: (listId, task) => {
      updateItem(`${WORK_KEY}/${listId}/items`, task)
    },
    deleteTask: (listId, task) => {
      deleteItem(`${WORK_KEY}/${listId}/items`, task)
    },
    reorderTasks: (listId, tasks) => {
      updateItemsList(`${WORK_KEY}/${listId}/items`, tasks)
    },

    addSubtask: (listId, taskId, description) => {
      addItem(`${WORK_KEY}/${listId}/items/${taskId}/subtasks`, {
        description,
      })
    },
    deleteSubtask: (listId, taskId, subtask) => {
      deleteItem(`${WORK_KEY}/${listId}/items/${taskId}/subtasks`, subtask)
    },

    getList: (listId) => lists?.[listId],
    getTask: (listId, taskId) => lists?.[listId]?.items?.[taskId],
  }

  return (
    <WorkStorageContext.Provider value={value}>
      {children}
    </WorkStorageContext.Provider>
  )
}

export function useWorkStorage(): WorkStorageContextType {
  const context = useContext(WorkStorageContext)
  if (!context) {
    throw new Error("missing WorkStorageContext provider")
  }
  return context
}
