import { Task, TaskListProps } from "../types"
import { TodayTask } from "./TodayTask"

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
          <li key={task.id} className={`today-task status-${task.status}`}>
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
