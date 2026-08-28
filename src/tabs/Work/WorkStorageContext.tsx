import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react"
import {
  FirebaseContext,
  useStorageContext,
} from "../../shared/FirebaseContext"
import {
  Colour,
  Label,
  LABELS_KEY,
  StoredLabel,
  Subtask,
  WorkTask,
  WORK_KEY,
} from "./types"

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

  addSubtask: (listId: string, taskId: string, description: string) => void
  deleteSubtask: (listId: string, taskId: string, subtask: Subtask) => void
  updateSubtasksList: (
    listId: string,
    taskId: string,
    subtasks: Subtask[],
  ) => void

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
  const {
    addItem,
    updateItem,
    deleteItem,
    updateList: updateItemsList,
    useValue,
  } = useStorageContext()

  const { value: rawLists, loading: isLoading } =
    useValue<Record<string, WorkTask>>(WORK_KEY)

  // Backfills parentId onto lists/tasks written before addList/addTask
  // started setting it, so addLabel/removeLabel can rely on it always
  // being there.
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

  const markLabelAsUsed = (id: string) => {
    const storedLabel = storedLabelsById?.[id]
    if (storedLabel?.lastRemoved !== undefined) {
      const { lastRemoved: _lastRemoved, ...withoutLastRemoved } = storedLabel
      updateItem(LABELS_KEY, withoutLastRemoved)
    }
  }

  const upsertLabel = (label: Label): string => {
    const existing = labels.find((l) => l.value === label.value)
    if (existing) {
      markLabelAsUsed(existing.id)
      return existing.id
    }
    return addItem<StoredLabel>(LABELS_KEY, label) ?? ""
  }

  const markUnusedLabel = (id: string) => {
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
    const previousTask = lists?.[listId]?.items?.[task.id]
    updateItem(`${WORK_KEY}/${listId}/items`, task)
    if (!previousTask) return

    const oldLabelIds = previousTask.labelIds ?? []
    const newLabelIds = task.labelIds ?? []
    const removedLabelIds = new Set(
      oldLabelIds.filter((id) => !newLabelIds.includes(id)),
    )
    const addedLabelIds = new Set(
      newLabelIds.filter((id) => !oldLabelIds.includes(id)),
    )

    if (previousTask.status !== "done" && task.status === "done") {
      newLabelIds.forEach((id) => removedLabelIds.add(id))
    }
    if (previousTask.status === "done" && task.status !== "done") {
      newLabelIds.forEach((id) => addedLabelIds.add(id))
    }

    removedLabelIds.forEach((id) => markUnusedLabel(id))
    addedLabelIds.forEach((id) => markLabelAsUsed(id))
  }

  const value: WorkStorageContextType = {
    lists,
    isLoading,

    addList: (listName, label) => {
      const labelId = label && upsertLabel(label)
      addItem(WORK_KEY, {
        description: listName,
        parentId: WORK_KEY,
        ...(labelId && { labelIds: [labelId] }),
      })
    },
    updateList,
    deleteList: (list) => {
      deleteItem(WORK_KEY, list)
      list.labelIds?.forEach((id) => markUnusedLabel(id))
    },
    reorderLists: (reorderedLists) => {
      updateItemsList(WORK_KEY, reorderedLists)
    },

    addTask: (listId, { labels: newLabels, ...task }) => {
      const resolvedIds = newLabels?.map(upsertLabel) ?? []
      const labelIds = [...(task.labelIds ?? []), ...resolvedIds]
      addItem(`${WORK_KEY}/${listId}/items`, {
        ...task,
        parentId: `${WORK_KEY}/${listId}/items`,
        ...(labelIds.length > 0 && { labelIds }),
      })
    },
    updateTask,
    deleteTask: (listId, task) => {
      deleteItem(`${WORK_KEY}/${listId}/items`, task)
      task.labelIds?.forEach((id) => markUnusedLabel(id))
    },
    reorderTasks: (listId, tasks) => {
      updateItemsList(`${WORK_KEY}/${listId}/items`, tasks)
    },

    addSubtask: (listId, taskId, description) => {
      addItem(`${WORK_KEY}/${listId}/items/${taskId}/subtasks`, { description })
    },
    deleteSubtask: (listId, taskId, subtask) => {
      deleteItem(`${WORK_KEY}/${listId}/items/${taskId}/subtasks`, subtask)
    },
    updateSubtasksList: (listId, taskId, subtasks) => {
      updateItemsList(
        `${WORK_KEY}/${listId}/items/${taskId}/subtasks`,
        subtasks,
      )
    },

    getList: (listId) => lists?.[listId],
    getTask: (listId, taskId) => lists?.[listId]?.items?.[taskId],

    labels,
    getLabel: (id) => storedLabelsById?.[id],

    addLabel: (label, entity) => {
      const id = upsertLabel(label)
      const labelIds = Array.from(new Set([...(entity.labelIds ?? []), id]))
      updateItem(entity.parentId, { ...entity, labelIds })
    },
    removeLabel: (id, entity) => {
      const labelIds = (entity.labelIds ?? []).filter(
        (labelId) => labelId !== id,
      )
      updateItem(entity.parentId, { ...entity, labelIds })
      markUnusedLabel(id)
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
