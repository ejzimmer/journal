import { CalendarTask, TaskListProps } from "../types"
import { DueDateTask } from "./DueDateTask"

export function DueDateList({
  tasks,
  onChangeTask,
  onDeleteTask,
}: TaskListProps<CalendarTask>) {
  if (!tasks) {
    return <div>No tasks</div>
  }

  return (
    <ul>
      {tasks
        .sort((a, b) => a.dueDate - b.dueDate)
        .map((task) => (
          <li
            key={task.description}
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            <DueDateTask
              task={task}
              onChange={onChangeTask}
              onDelete={() => onDeleteTask(task)}
            />
          </li>
        ))}
    </ul>
  )
}
