import { isBefore, isSameDay, startOfDay } from "date-fns"
import { AddDueDateTaskForm } from "./AddDueDateTaskForm"
import { DueDateTask } from "./DueDateTask"

import "./DueDateTask.css"
import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { CalendarTask, PARENT_LIST } from "./types"

const taskIsFinished = (task: CalendarTask) =>
  task.status === "finished" && isBefore(task.dueDate, startOfDay(new Date()))

const taskIsToday = (task: CalendarTask) => isSameDay(task.dueDate, new Date())

export function DueDateList() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value } = storageContext.useValue<CalendarTask>(PARENT_LIST)
  const tasks = value ? Object.values(value) : []

  const readyToReset = tasks.some(taskIsFinished)
  if (readyToReset) {
    const finishedTasks = tasks.filter(taskIsFinished)
    finishedTasks.forEach((task) =>
      storageContext.deleteItem<CalendarTask>(PARENT_LIST, task)
    )
    const todayTasks = tasks.filter(
      (task) => taskIsToday(task) && task.status === "paused"
    )
    todayTasks.forEach((task) =>
      storageContext.updateItem(PARENT_LIST, { ...task, status: "ready" })
    )
  }

  return (
    <div className="todo-task-list calendar">
      {tasks.length ? (
        <ul>
          {tasks
            .sort((a, b) => a.dueDate - b.dueDate)
            .map((task) => (
              <li key={task.id} className={`status-${task.status}`}>
                <DueDateTask task={task} />
              </li>
            ))}
        </ul>
      ) : (
        <div>No tasks</div>
      )}
      <AddDueDateTaskForm />
    </div>
  )
}
