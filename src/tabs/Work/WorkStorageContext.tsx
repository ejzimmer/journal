import { createContext, ReactNode, useContext, useMemo } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Label, Subtask, WorkTask, WORK_KEY } from "./types"
import { getNextColour } from "./LabelsControl"

export type LabelTarget = { listId: string; taskId?: string }

export type WorkStorageContextType = {
  lists?: Record<string, WorkTask>
  isLoading: boolean

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

  labels: Label[]
  createLabel: (target: LabelTarget, value: string) => Label
  editLabel: (oldLabel: Label, newLabel: Label) => void
  deleteLabel: (target: LabelTarget, label: Label) => void
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

  const { value: lists, loading: isLoading } =
    useValue<Record<string, WorkTask>>(WORK_KEY)

  const labels = useMemo(() => {
    const uniqueLabels = new Map<string, Label>()
    Object.values(lists ?? {}).forEach((list) => {
      list.labels?.forEach((label) => uniqueLabels.set(label.value, label))
      Object.values(list.items ?? {}).forEach((task) => {
        task.labels?.forEach((label) => uniqueLabels.set(label.value, label))
      })
    })
    return Array.from(uniqueLabels.values())
  }, [lists])

  // Keeps duplicated label copies visually consistent: a label added to a
  // task/list picks up the colour of any existing label with the same
  // value, rather than trusting whatever colour the caller happened to have.
  const normalizeLabels = (taskLabels?: Label[]): Label[] | undefined =>
    taskLabels?.map(
      (label) => labels.find((l) => l.value === label.value) ?? label,
    )

  const updateList = (list: WorkTask) => {
    updateItem(WORK_KEY, list)
  }
  const updateTask = (listId: string, task: WorkTask) => {
    updateItem(`${WORK_KEY}/${listId}/items`, task)
  }

  const getLabelTarget = (target: LabelTarget) =>
    target.taskId
      ? lists?.[target.listId]?.items?.[target.taskId]
      : lists?.[target.listId]

  const setLabelsForTarget = (target: LabelTarget, updatedLabels: Label[]) => {
    const item = getLabelTarget(target)
    if (!item) return
    if (target.taskId) {
      updateTask(target.listId, { ...item, labels: updatedLabels })
    } else {
      updateList({ ...item, labels: updatedLabels })
    }
  }

  const value: WorkStorageContextType = {
    lists,
    isLoading,
    labels,

    addList: (listName, newLabels = []) => {
      addItem(WORK_KEY, {
        description: listName,
        ...(newLabels.length > 0 && {
          labels: normalizeLabels(newLabels),
        }),
      })
    },
    updateList,
    deleteList: (list) => {
      deleteItem(WORK_KEY, list)
    },
    reorderLists: (reorderedLists) => {
      updateItemsList(WORK_KEY, reorderedLists)
    },

    addTask: (listId, task) => {
      addItem(`${WORK_KEY}/${listId}/items`, {
        ...task,
        ...(task.labels && { labels: normalizeLabels(task.labels) }),
      })
    },
    updateTask,
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

    createLabel: (target, labelValue) => {
      const colour = getNextColour(labels.map((l) => l.colour))
      const newLabel: Label = { value: labelValue, colour }
      const existingLabels = getLabelTarget(target)?.labels ?? []
      setLabelsForTarget(target, [...existingLabels, newLabel])
      return newLabel
    },
    editLabel: (oldLabel, newLabel) => {
      Object.values(lists ?? {}).forEach((list) => {
        if (list.labels?.some((l) => l.value === oldLabel.value)) {
          updateList({
            ...list,
            labels: list.labels.map((l) =>
              l.value === oldLabel.value ? newLabel : l,
            ),
          })
        }
        Object.values(list.items ?? {}).forEach((task) => {
          if (task.labels?.some((l) => l.value === oldLabel.value)) {
            updateTask(list.id, {
              ...task,
              labels: task.labels.map((l) =>
                l.value === oldLabel.value ? newLabel : l,
              ),
            })
          }
        })
      })
    },
    deleteLabel: (target, label) => {
      const existingLabels = getLabelTarget(target)?.labels ?? []
      setLabelsForTarget(
        target,
        existingLabels.filter((l) => l !== label),
      )
    },
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
