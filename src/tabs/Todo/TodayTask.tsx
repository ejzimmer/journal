import { EditableText } from "../../shared/controls/EditableText"
import { DeleteButton } from "./DeleteButton"
import { Task, TaskListProps } from "./types"

import "./TodayTask.css"

export function TodayList({
  tasks,
  onChangeTask,
  onDeleteTask,
}: TaskListProps) {
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

export function TodayTask({
  task,
  onChange,
  onDelete,
}: {
  task: Task
  onChange: (task: Task) => void
  onDelete: () => void
}) {
  const handleStatusChange = () => {
    if (task.status === "done" || task.status === "finished") {
      onChange({ ...task, status: "ready" })
    } else if (task.type === "毎日") {
      onChange({ ...task, status: "done" })
    } else {
      onChange({ ...task, status: "finished" })
    }
  }

  return (
    <div className={`today-task status-${task.status}`}>
      <div className="button-edge">
        <div className="button-surface">
          <span>
            <label className="led">
              <input
                aria-label="done"
                type="checkbox"
                onChange={handleStatusChange}
                checked={task.status === "done" || task.status === "finished"}
              />
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                flexGrow: 1,
              }}
            >
              {task.category.emoji}
              <EditableText
                label="description"
                onChange={(description) => onChange({ ...task, description })}
              >
                {task.description}
              </EditableText>
            </div>
            <DeleteButton onDelete={onDelete} />
          </span>
        </div>
      </div>
    </div>
  )
}
