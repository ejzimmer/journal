import { endOfDay, isAfter, subDays } from "date-fns"
import { AddThisWeekTaskForm } from "./AddThisWeekTaskForm"
import { ThisWeekTask } from "./ThisWeekTask"
import { WEEKLY_KEY, WeeklyTask } from "../../../shared/types"
import { useContext, useMemo, useRef } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { sortByPosition } from "../../../shared/drag-and-drop/utils"

export function refreshTasks(
  tasks: WeeklyTask[],
  updateTask: (task: WeeklyTask) => void,
) {
  tasks.forEach((task) => {
    if (!task.completed) return

    const completed: (number | null)[] = Array.isArray(task.completed)
      ? task.completed
      : Object.values(task.completed)

    const updatedCompleted = completed.filter((date) => {
      return date && isAfter(date, endOfDay(subDays(new Date(), 7)))
    })
    if (updatedCompleted.length !== task.completed.length) {
      updateTask({ ...task, completed: updatedCompleted })
    }
  })
}

export function ThisWeekList() {
  const listRef = useRef<HTMLOListElement>(null)
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value } =
    storageContext.useValue<Record<string, WeeklyTask>>(WEEKLY_KEY)

  const taskOrder = useRef<string[]>([])

  if (value && taskOrder.current.length !== Object.values(value).length) {
    taskOrder.current = Object.values(value)
      .toSorted((a, b) => {
        const aUrgency = a.frequency - (a.completed?.length ?? 0)
        const bUrgency = b.frequency - (b.completed?.length ?? 0)

        if (aUrgency === bUrgency) {
          return (a.completed?.at(-1) ?? 0) - (b.completed?.at(-1) ?? 0)
        }

        return bUrgency - aUrgency
      })
      .map((task) => task.id)
  }

  const tasks = value ? taskOrder.current.map((id) => value[id]) : []

  refreshTasks(tasks, (task) => {
    storageContext.updateItem<WeeklyTask>(WEEKLY_KEY, task)
  })

  return (
    <div className="todo-task-list weekly">
      {tasks.length ? (
        <ol ref={listRef}>
          {tasks.map((task, index) => (
            <li key={task.id} className="item">
              <ThisWeekTask task={task} />
            </li>
          ))}
        </ol>
      ) : (
        <div>No tasks</div>
      )}
      <AddThisWeekTaskForm />
    </div>
  )
}
