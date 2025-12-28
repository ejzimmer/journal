import { isBefore, startOfDay } from "date-fns"
import { AddDueDateTaskForm } from "./AddDueDateTaskForm"
import { DueDateTask } from "./DueDateTask"

import "./DueDateTask.css"
import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { CalendarTask, PARENT_LIST } from "./types"

const taskIsFinished = (task: CalendarTask) =>
  task.status === "finished" && isBefore(task.dueDate, startOfDay(new Date()))

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
      storageContext.deleteItem(PARENT_LIST, task)
    )
  }

  return (
    <div className="todo-task-list calendar">
      {tasks.length ? (
        <ul>
          {tasks
            .sort((a, b) => a.dueDate - b.dueDate)
            .map((task) => (
              <li key={task.description} className={`status-${task.status}`}>
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
