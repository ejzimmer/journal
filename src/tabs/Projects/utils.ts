import { useContext } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import {
  Category,
  DAILY_KEY,
  DailyTask,
  PROJECTS_KEY,
} from "../../shared/types"
import { OrderedListItem } from "../../shared/drag-and-drop/types"

export const getSubtasksKey = (projectId: string, subtaskId?: string) => {
  const key = PROJECTS_KEY + `/${projectId}/subtasks`

  return subtaskId ? `${key}/${subtaskId}` : key
}

export function useLinkedTasks(linkedId?: string) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const { value: linkedTask } = storageContext.useValue<DailyTask>(
    linkedId && `${DAILY_KEY}/${linkedId}`,
  )

  const createLinkedTask = ({
    description,
    category,
    linkedTaskId,
  }: {
    description: string
    category: Category
    linkedTaskId: string
  }) => {
    const linkedId = storageContext.addItem<
      Omit<DailyTask, keyof OrderedListItem>
    >(DAILY_KEY, {
      category: { emoji: category, text: category },
      description,
      status: "ready",
      type: "一度",
      lastCompleted: new Date().getTime(),
      linkedTask: linkedTaskId,
    })

    return linkedId
  }

  const updateLinkedTask = (updatedTask: Partial<DailyTask>) => {
    if (!linkedTask) return

    storageContext.updateItem<DailyTask>(DAILY_KEY, {
      ...linkedTask,
      ...updatedTask,
    })
  }

  return { linkedTask, createLinkedTask, updateLinkedTask }
}
