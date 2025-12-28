import { TodayTask } from "./TodayTask"

import { AddTodayTaskForm } from "./AddTodayTaskForm"
import { isBefore, startOfDay } from "date-fns"
import { DailyTask, PARENT_LIST } from "./types"
import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"

const updatedYesterday = (task: DailyTask, status: DailyTask["status"]) =>
  task.status === status && isBefore(task.lastCompleted, startOfDay(new Date()))

export function TodayList() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value } = storageContext.useValue<DailyTask>(PARENT_LIST)
  const tasks = value ? Object.values(value) : []

  const finishedTasks = tasks.filter((task) =>
    updatedYesterday(task, "finished")
  )
  finishedTasks.forEach((task) =>
    storageContext.deleteItem<DailyTask>(PARENT_LIST, task)
  )

  const readyToReset = tasks.filter((task) => updatedYesterday(task, "done"))
  readyToReset.forEach((task) =>
    storageContext.updateItem<DailyTask>(PARENT_LIST, {
      ...task,
      status: "ready",
      lastCompleted: new Date().getTime(),
    })
  )

  return (
    <div className="todo-task-list">
      {tasks.length ? (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className={`today-task status-${task.status}`}>
              <TodayTask task={task} />
            </li>
          ))}
        </ul>
      ) : (
        <div>No tasks for today</div>
      )}
      <AddTodayTaskForm />
    </div>
  )
}
