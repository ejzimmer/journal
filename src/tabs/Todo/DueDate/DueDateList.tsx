import { CalendarTask, TaskListProps } from "../types"
import { AddDueDateTaskForm } from "./AddDueDateTaskForm"
import { DueDateTask } from "./DueDateTask"

import "./DueDateTask.css"

export function DueDateList({
  tasks,
  onChangeTask,
  onDeleteTask,
  onCreateTask,
  categories,
}: TaskListProps<CalendarTask>) {
  if (!tasks) {
    return <div>No tasks</div>
  }

  return (
    <div className="todo-task-list calendar">
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
      <AddDueDateTaskForm categories={categories} onSubmit={onCreateTask} />
    </div>
  )
}
