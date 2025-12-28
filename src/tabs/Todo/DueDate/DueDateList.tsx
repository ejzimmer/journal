import { endOfDay, isAfter, isBefore, startOfDay } from "date-fns"
import { Calendar, Task, TaskListProps } from "../types"
import { AddDueDateTaskForm, TaskDetails } from "./AddDueDateTaskForm"
import { DueDateTask } from "./DueDateTask"

import "./DueDateTask.css"

export type CalendarTask = Calendar & Task

export function DueDateList({
  tasks,
  onUpdateList,
  createTask,
  categories,
}: TaskListProps<Calendar>) {
  const readyToReset = tasks.some(
    (task) =>
      task.status === "finished" &&
      isBefore(task.dueDate, startOfDay(new Date()))
  )
  if (readyToReset) {
    onUpdateList(
      tasks.filter(
        (task) =>
          task.status !== "finished" ||
          isAfter(task.dueDate, endOfDay(new Date()))
      )
    )
  }

  const onChangeTask = (task: CalendarTask) => {
    const index = tasks.findIndex((t) => t.id === task.id)
    onUpdateList(tasks.with(index, task))
  }
  const onDeleteTask = (task: Task) => {
    const index = tasks.findIndex((t) => t.id === task.id)
    onUpdateList(tasks.toSpliced(index, 1))
  }
  const onCreateTask = (details: TaskDetails) => {
    const task = createTask({ ...details, status: "ready" })
    onUpdateList([...tasks, task])
  }

  return (
    <div className="todo-task-list calendar">
      {tasks.length ? (
        <ul>
          {tasks
            .sort((a, b) => a.dueDate - b.dueDate)
            .map((task) => (
              <li key={task.description} className={`status-${task.status}`}>
                <DueDateTask
                  task={task}
                  onChange={onChangeTask}
                  onDelete={() => onDeleteTask(task)}
                />
              </li>
            ))}
        </ul>
      ) : (
        <div>No tasks</div>
      )}
      <AddDueDateTaskForm categories={categories} onSubmit={onCreateTask} />
    </div>
  )
}
