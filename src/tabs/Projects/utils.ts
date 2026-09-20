import { useStorageContext } from "../../shared/FirebaseContext"
import {
  Category,
  DAILY_KEY,
  DailyTask,
  ProjectDetails,
  PROJECTS_KEY,
} from "../../shared/types"
import { OrderedListItem } from "../../shared/drag-and-drop/types"
import { renumberPositions } from "../../shared/drag-and-drop/utils"

export const getSubtasksKey = (projectId: string, subtaskId?: string) => {
  const key = PROJECTS_KEY + `/${projectId}/subtasks`

  return subtaskId ? `${key}/${subtaskId}` : key
}

export function useLinkedTasks(linkedId?: string) {
  const { useValue, addItem, updateItem } = useStorageContext()

  const { value: linkedTask } = useValue<DailyTask>(
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
    const linkedId = addItem<Omit<DailyTask, keyof OrderedListItem>>(
      DAILY_KEY,
      {
        category,
        description,
        status: "ready",
        type: "一度",
        lastCompleted: new Date().getTime(),
        linkedTask: linkedTaskId,
      },
    )

    return linkedId
  }

  const updateLinkedTask = (updatedTask: Partial<DailyTask>) => {
    if (!linkedTask) return

    updateItem<DailyTask>(DAILY_KEY, {
      ...linkedTask,
      ...updatedTask,
    })
  }

  return { linkedTask, createLinkedTask, updateLinkedTask }
}

export function reorderProjects(
  projects: ProjectDetails[],
  indexToRemove: number,
) {
  return renumberPositions(projects.toSpliced(indexToRemove, 1))
}
