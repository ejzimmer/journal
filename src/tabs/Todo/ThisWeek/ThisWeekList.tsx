import { isBefore, subDays } from "date-fns"
import { AddThisWeekTaskForm } from "./AddThisWeekTaskForm"
import { ThisWeekTask } from "./ThisWeekTask"
import { PARENT_LIST, WeeklyTask } from "./types"
import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"

const moreThanAWeekAgo = (date: number | undefined) =>
  date && isBefore(date, subDays(new Date(), 7))

export function ThisWeekList() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value } = storageContext.useValue<WeeklyTask>(PARENT_LIST)
  const tasks = value ? Object.values(value) : []

  const readyForReset = tasks.filter((task) =>
    task.completed?.some(moreThanAWeekAgo)
  )
  readyForReset.forEach((task) =>
    storageContext.updateItem<WeeklyTask>(PARENT_LIST, {
      ...task,
      completed: task.completed?.map((date) =>
        moreThanAWeekAgo(date) ? undefined : date
      ),
    })
  )

  return (
    <div className="todo-task-list weekly">
      {tasks.length ? (
        <ul>
          {tasks.map((task) => (
            <li key={task.description}>
              <ThisWeekTask task={task} />
            </li>
          ))}
        </ul>
      ) : (
        <div>No tasks</div>
      )}
      <AddThisWeekTaskForm />
    </div>
  )
}
