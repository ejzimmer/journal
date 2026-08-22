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

  addList: (listName: string, label?: Label) => void
  updateList: (list: WorkTask) => void
  deleteList: (list: WorkTask) => void
  reorderLists: <T extends { id: string }>(lists: T[]) => void

  addTask: (
    listId: string,
    task: Partial<WorkTask> & { description: string; labels?: Label[] },
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
  addLabel: (label: Label, entity: WorkTask) => void
  removeLabel: (id: string, entity: WorkTask) => void
  updateLabel: (id: string, colour: Colour) => void
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

  const { value: rawLists, loading: isLoading } =
    useValue<Record<string, WorkTask>>(WORK_KEY)

  // parentId is only ever written into seed data, never by addList/addTask
  // — derive it here instead of trusting whatever's actually stored, so
  // every list/task can be updated (e.g. by addLabel/removeLabel) purely
  // from the object itself, without the caller needing to pass a listId.
  const lists = useMemo(() => {
    if (!rawLists) return rawLists
    const normalized: Record<string, WorkTask> = {}
    Object.entries(rawLists).forEach(([listId, list]) => {
      const items =
        list.items &&
        Object.fromEntries(
          Object.entries(list.items).map(([taskId, task]) => [
            taskId,
            { ...task, parentId: `${WORK_KEY}/${listId}/items` },
          ]),
        )
      normalized[listId] = {
        ...list,
        parentId: WORK_KEY,
        ...(items && { items }),
      }
    })
    return normalized
  }, [rawLists])

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
    const previous = lists?.[listId]?.items?.[task.id]
    if (previous) {
      const oldIds = previous.labelIds ?? []
      const newIds = task.labelIds ?? []
      const toCheck = new Set(oldIds.filter((id) => !newIds.includes(id)))
      const toRevive = new Set(newIds.filter((id) => !oldIds.includes(id)))

      if (previous.status !== "done" && task.status === "done") {
        newIds.forEach((id) => toCheck.add(id))
      }
      if (previous.status === "done" && task.status !== "done") {
        newIds.forEach((id) => toRevive.add(id))
      }

      toCheck.forEach((id) => markUnusedIfOrphaned(id))
      toRevive.forEach((id) => reviveLabelById(id))
    }
    updateItem(`${WORK_KEY}/${listId}/items`, task)
  }

  const value: WorkStorageContextType = {
    lists,
    isLoading,

    addList: (listName, label) => {
      const labelId = label && resolveLabelId(label)
      addItem(WORK_KEY, {
        description: listName,
        ...(labelId && { labelIds: [labelId] }),
      })
    },
    updateList,
    deleteList: (list) => {
      deleteItem(WORK_KEY, list)
      list.labelIds?.forEach((id) => markUnusedIfOrphaned(id))
    },
    reorderLists: (reorderedLists) => {
      updateItemsList(WORK_KEY, reorderedLists)
    },

    addTask: (listId, { labels: newLabels, ...task }) => {
      const resolvedIds = newLabels?.map(resolveLabelId) ?? []
      const labelIds = [...(task.labelIds ?? []), ...resolvedIds]
      addItem(`${WORK_KEY}/${listId}/items`, {
        ...task,
        ...(labelIds.length > 0 && { labelIds }),
      })
    },
    updateTask,
    deleteTask: (listId, task) => {
      deleteItem(`${WORK_KEY}/${listId}/items`, task)
      task.labelIds?.forEach((id) => markUnusedIfOrphaned(id))
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

    addLabel: (label, entity) => {
      const id = resolveLabelId(label)
      const labelIds = Array.from(new Set([...(entity.labelIds ?? []), id]))
      updateItem(entity.parentId, { ...entity, labelIds })
    },
    removeLabel: (id, entity) => {
      const labelIds = (entity.labelIds ?? []).filter(
        (labelId) => labelId !== id,
      )
      updateItem(entity.parentId, { ...entity, labelIds })
      markUnusedIfOrphaned(id)
    },

    updateLabel: (id, colour) => {
      const storedLabel = storedLabelsById?.[id]
      if (!storedLabel) return
      updateItem(LABELS_KEY, { ...storedLabel, colour })
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
