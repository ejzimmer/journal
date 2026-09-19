import { useStorageContext } from "../../shared/FirebaseContext"
import {
  Category,
  DAILY_KEY,
  DailyTask,
  ProjectDetails,
  PROJECTS_KEY,
} from "../../shared/types"
import { OrderedListItem } from "../../shared/drag-and-drop/types"

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
  return projects
    .toSpliced(indexToRemove, 1)
    .map((project, index) => ({ ...project, position: index }))
}

const getStatus = (project: ProjectDetails) => project.status ?? "ready"

function moveProject(
  projects: ProjectDetails[],
  indexToMove: number,
  findDestination: (remainingProjects: ProjectDetails[]) => number,
) {
  const remainingProjects = projects.toSpliced(indexToMove, 1)
  const destination = findDestination(remainingProjects)

  return remainingProjects
    .toSpliced(
      destination === -1 ? remainingProjects.length : destination,
      0,
      projects[indexToMove],
    )
    .map((project, index) => ({ ...project, position: index }))
}

export function moveProjectToStart(
  projects: ProjectDetails[],
  indexToMove: number,
) {
  return moveProject(projects, indexToMove, (remainingProjects) =>
    remainingProjects.findIndex(
      (project) => getStatus(project) !== "in_progress",
    ),
  )
}

export function moveProjectToEnd(
  projects: ProjectDetails[],
  indexToMove: number,
) {
  return moveProject(projects, indexToMove, (remainingProjects) =>
    remainingProjects.findIndex((project) => getStatus(project) === "done"),
  )
}
