import { Daily, Task, TaskListProps } from "../types"
import { TodayTask } from "./TodayTask"

import { AddTodayTaskForm, TaskDetails } from "./AddTodayTaskForm"
import { isBefore, startOfDay } from "date-fns"

export type DailyTask = Daily & Task

const updatedYesterday = (task: DailyTask, status: DailyTask["status"]) =>
  task.status === status && isBefore(task.lastCompleted, startOfDay(new Date()))

export function TodayList({
  tasks,
  createTask,
  onUpdateList,
  categories,
}: TaskListProps<Daily>) {
  const finishedTasks = tasks.filter((task) =>
    updatedYesterday(task, "finished")
  )
  if (finishedTasks.length) {
    onUpdateList(tasks.filter((task) => !finishedTasks.includes(task)))
  }

  const readyToReset = tasks.some((task) => updatedYesterday(task, "done"))
  if (readyToReset) {
    onUpdateList(
      tasks.map((task) => ({
        ...task,
        status: "ready",
        lastUpdated: new Date().getDate(),
      }))
    )
  }

  const onChangeTask = (task: DailyTask) => {
    const index = tasks.findIndex((t) => t.id === task.id)
    onUpdateList(tasks.with(index, task))
  }
  const onDeleteTask = (task: Task) => {
    const index = tasks.findIndex((t) => t.id === task.id)
    onUpdateList(tasks.toSpliced(index, 1))
  }
  const onCreateTask = (details: TaskDetails) => {
    const task = createTask({
      ...details,
      status: "ready",
      lastCompleted: new Date().getDate(),
    })
    onUpdateList([...tasks, task])
  }

  return (
    <div className="todo-task-list">
      {tasks.length ? (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className={`today-task status-${task.status}`}>
              <TodayTask
                task={task}
                onChange={onChangeTask}
                onDelete={() => onDeleteTask(task)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div>No tasks for today</div>
      )}
      <AddTodayTaskForm categories={categories} onSubmit={onCreateTask} />
    </div>
  )
}
