import { isBefore, isSameDay, startOfDay } from "date-fns"
import { AddDueDateTaskForm } from "./AddDueDateTaskForm"
import { DueDateTask } from "./DueDateTask"

import "./DueDateTask.css"
import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { CalendarTask, CALENDAR_KEY } from "../../../shared/types"

const readyToDelete = (task: CalendarTask) => {
  const today = startOfDay(new Date())
  return (
    task.status === "finished" &&
    isBefore(task.dueDate, today) &&
    isBefore(task.statusUpdateDate, today)
  )
}

const taskIsToday = (task: CalendarTask) => isSameDay(task.dueDate, new Date())

export function DueDateList() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value } = storageContext.useValue<CalendarTask>(CALENDAR_KEY)
  const tasks = value ? Object.values(value) : []

  const readyToReset = tasks.some(readyToDelete)
  if (readyToReset) {
    const finishedTasks = tasks.filter(readyToDelete)
    finishedTasks.forEach((task) =>
      storageContext.deleteItem<CalendarTask>(CALENDAR_KEY, task),
    )
    const todayTasks = tasks.filter(
      (task) => taskIsToday(task) && task.status === "paused",
    )
    todayTasks.forEach((task) =>
      storageContext.updateItem(CALENDAR_KEY, { ...task, status: "ready" }),
    )
  }

  return (
    <div className="todo-task-list calendar">
      {tasks.length ? (
        <ol>
          {tasks
            .sort((a, b) => a.dueDate - b.dueDate)
            .map((task) => (
              <li key={task.id} className={`status-${task.status}`}>
                <DueDateTask task={task} />
              </li>
            ))}
        </ol>
      ) : (
        <div>No tasks</div>
      )}
      <AddDueDateTaskForm />
    </div>
  )
}
