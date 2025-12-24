import { Task, TaskListProps } from "../types"
import { TodayTask } from "./TodayTask"

export function TodayList({
  tasks,
  onChangeTask,
  onDeleteTask,
}: TaskListProps<Task>) {
  if (!tasks) {
    return <div>No tasks for today</div>
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li
          key={task.id}
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          <TodayTask
            task={task}
            onChange={onChangeTask}
            onDelete={() => onDeleteTask(task)}
          />
        </li>
      ))}
    </ul>
  )
}
