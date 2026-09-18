import { AddThisWeekTaskForm } from "./AddThisWeekTaskForm"
import { ThisWeekTask } from "./ThisWeekTask"
import { WEEKLY_KEY, WeeklyTask } from "../../../shared/types"
import { useRef } from "react"
import { useStorageContext } from "../../../shared/FirebaseContext"
import { useWeeklyReset } from "./useWeeklyReset"

export function ThisWeekList() {
  const listRef = useRef<HTMLOListElement>(null)
  const { useValue } = useStorageContext()
  const { value } = useValue<Record<string, WeeklyTask>>(WEEKLY_KEY)

  useWeeklyReset()

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
