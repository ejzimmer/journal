import { Task, TaskListProps } from "../types"
import { TodayTask } from "./TodayTask"

import "./TodayList.css"
import { AddTodayTaskForm } from "./AddTodayTaskForm"

export function TodayList({
  tasks,
  onChangeTask,
  onDeleteTask,
  onCreateTask,
  categories,
}: TaskListProps<Task>) {
  if (!tasks) {
    return <div>No tasks for today</div>
  }

  return (
    <div className="todo-task-list">
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <TodayTask
              task={task}
              onChange={onChangeTask}
              onDelete={() => onDeleteTask(task)}
            />
          </li>
        ))}
      </ul>
      <AddTodayTaskForm categories={categories} onSubmit={onCreateTask} />
    </div>
  )
}
