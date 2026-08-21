import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import {
  Colour,
  Label,
  LABELS_KEY,
  StoredLabel,
  Subtask,
  WorkTask,
  WORK_KEY,
} from "./types"
import { cleanupDoneOnlyLabels } from "./cleanupDoneOnlyLabels"

const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000

export type WorkStorageContextType = {
  lists?: Record<string, WorkTask>
  isLoading: boolean

  addList: (listName: string, labelIds?: string[]) => void
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

  addSubtask: (
    listId: string,
    taskId: string,
    description: string,
    id?: string,
  ) => void
  deleteSubtask: (listId: string, taskId: string, subtask: Subtask) => void

  getList: (listId: string) => WorkTask | undefined
  getTask: (listId: string, taskId: string) => WorkTask | undefined

  labels: StoredLabel[]
  getLabel: (id: string) => StoredLabel | undefined
  resolveLabel: (label: Label) => string
  addLabelToTask: (label: Label, task: WorkTask, list: WorkTask) => void
  removeLabelFromTask: (id: string, task: WorkTask, list: WorkTask) => void
  addLabelToList: (label: Label, list: WorkTask) => void
  removeLabelFromList: (id: string, list: WorkTask) => void
  updateLabel: (id: string, colour: Colour) => void
  markLabelUnusedIfOrphaned: (id: string) => void
  reviveLabel: (id: string) => void
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

  const { value: storedLabelsById, loading: labelsLoading } =
    useValue<Record<string, StoredLabel>>(LABELS_KEY)

  const labels = useMemo(
    () => Object.values(storedLabelsById ?? {}),
    [storedLabelsById],
  )

  // One-off sweep when the label store first loads: labels unused for more
  // than a week (lastRemoved set long enough ago) are purged for good.
  const hasSweptStaleLabels = useRef(false)
  useEffect(() => {
    if (labelsLoading || hasSweptStaleLabels.current) return
    hasSweptStaleLabels.current = true

    const staleBefore = Date.now() - STALE_AFTER_MS
    labels.forEach((label) => {
      if (label.lastRemoved !== undefined && label.lastRemoved < staleBefore) {
        deleteItem(LABELS_KEY, label)
      }
    })
  }, [labelsLoading, labels, deleteItem])

  // TEMPORARY one-off cleanup, run once when both the task tree and label
  // store have loaded: see cleanupDoneOnlyLabels for why this exists. Safe
  // to remove (along with cleanupDoneOnlyLabels) once it's run once in
  // production.
  const hasCleanedDoneOnlyLabels = useRef(false)
  useEffect(() => {
    if (hasCleanedDoneOnlyLabels.current || isLoading || labelsLoading) return
    hasCleanedDoneOnlyLabels.current = true
    if (lists) {
      cleanupDoneOnlyLabels(lists, labels, { updateItem })
    }
  }, [lists, isLoading, labels, labelsLoading, updateItem])

  // Done tasks are never deleted, so a label only ever attached to done
  // tasks would otherwise look "in use" forever. Treat done tasks as if
  // they didn't reference the label at all.
  const countLabelUsage = (id: string) => {
    let count = 0
    Object.values(lists ?? {}).forEach((list) => {
      if (list.labelIds?.includes(id)) count++
      Object.values(list.items ?? {}).forEach((task) => {
        if (task.status !== "done" && task.labelIds?.includes(id)) count++
      })
    })
    return count
  }

  const reviveLabelById = (id: string) => {
    const storedLabel = storedLabelsById?.[id]
    if (storedLabel?.lastRemoved !== undefined) {
      const { lastRemoved: _lastRemoved, ...withoutLastRemoved } = storedLabel
      updateItem(LABELS_KEY, withoutLastRemoved)
    }
  }

  // Reuses an existing stored label with the same value if there is one
  // (reviving it if it was pending removal), otherwise creates a new one.
  const resolveLabelId = (label: Label): string => {
    const existing = labels.find((l) => l.value === label.value)
    if (existing) {
      reviveLabelById(existing.id)
      return existing.id
    }
    return addItem<StoredLabel>(LABELS_KEY, label) ?? ""
  }

  // Marks a label as pending removal once nothing references it any more,
  // rather than deleting it immediately, so it can still be reused for a
  // while without recreating it from scratch.
  const markUnusedIfOrphaned = (id: string) => {
    if (countLabelUsage(id) > 1) return
    const storedLabel = storedLabelsById?.[id]
    if (storedLabel && storedLabel.lastRemoved === undefined) {
      updateItem(LABELS_KEY, { ...storedLabel, lastRemoved: Date.now() })
    }
  }

  const updateList = (list: WorkTask) => {
    updateItem(WORK_KEY, list)
  }
  const updateTask = (listId: string, task: WorkTask) => {
    updateItem(`${WORK_KEY}/${listId}/items`, task)
  }

  const value: WorkStorageContextType = {
    lists,
    isLoading,

    addList: (listName, labelIds = []) => {
      addItem(WORK_KEY, {
        description: listName,
        ...(labelIds.length > 0 && { labelIds }),
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
      addItem(`${WORK_KEY}/${listId}/items`, task)
    },
    updateTask,
    deleteTask: (listId, task) => {
      deleteItem(`${WORK_KEY}/${listId}/items`, task)
    },
    reorderTasks: (listId, tasks) => {
      updateItemsList(`${WORK_KEY}/${listId}/items`, tasks)
    },

    addSubtask: (listId, taskId, description, id) => {
      const path = `${WORK_KEY}/${listId}/items/${taskId}/subtasks`
      if (id) {
        // A caller-supplied id makes the write idempotent: rewriting the
        // same id/description pair (e.g. a retried or racing call) just
        // overwrites itself instead of creating a duplicate entry.
        updateItem(path, { id, description })
      } else {
        addItem(path, { description })
      }
    },
    deleteSubtask: (listId, taskId, subtask) => {
      deleteItem(`${WORK_KEY}/${listId}/items/${taskId}/subtasks`, subtask)
    },

    getList: (listId) => lists?.[listId],
    getTask: (listId, taskId) => lists?.[listId]?.items?.[taskId],

    labels,
    getLabel: (id) => storedLabelsById?.[id],
    resolveLabel: resolveLabelId,

    addLabelToTask: (label, task, list) => {
      const id = resolveLabelId(label)
      const labelIds = Array.from(new Set([...(task.labelIds ?? []), id]))
      updateTask(list.id, { ...task, labelIds })
    },
    removeLabelFromTask: (id, task, list) => {
      const labelIds = (task.labelIds ?? []).filter(
        (labelId) => labelId !== id,
      )
      updateTask(list.id, { ...task, labelIds })
      markUnusedIfOrphaned(id)
    },

    addLabelToList: (label, list) => {
      const id = resolveLabelId(label)
      const labelIds = Array.from(new Set([...(list.labelIds ?? []), id]))
      updateList({ ...list, labelIds })
    },
    removeLabelFromList: (id, list) => {
      const labelIds = (list.labelIds ?? []).filter(
        (labelId) => labelId !== id,
      )
      updateList({ ...list, labelIds })
      markUnusedIfOrphaned(id)
    },

    updateLabel: (id, colour) => {
      const storedLabel = storedLabelsById?.[id]
      if (!storedLabel) return
      updateItem(LABELS_KEY, { ...storedLabel, colour })
    },

    markLabelUnusedIfOrphaned: markUnusedIfOrphaned,
    reviveLabel: reviveLabelById,
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
