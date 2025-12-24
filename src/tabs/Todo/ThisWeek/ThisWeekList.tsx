import { TaskListProps, WeeklyTask } from "../types"
import { ThisWeekTask } from "./ThisWeekTask"

export function ThisWeekList({
  tasks,
  onChangeTask,
  onDeleteTask,
}: TaskListProps<WeeklyTask>) {
  if (!tasks) {
    return <div>No tasks</div>
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li
          key={task.description}
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          <ThisWeekTask
            task={task}
            onChange={onChangeTask}
            onDelete={() => onDeleteTask(task)}
          />
        </li>
      ))}
    </ul>
  )
}
