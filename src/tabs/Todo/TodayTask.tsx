import { EditableText } from "../../shared/controls/EditableText"
import { DeleteButton } from "./DeleteButton"
import { Task, TaskListProps } from "./types"

import "./TodayTask.css"
import { EmojiCheckbox } from "./EmojiCheckbox"

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
      <EmojiCheckbox
        emoji={task.category.emoji}
        isChecked={task.status === "done" || task.status === "finished"}
        onChange={handleStatusChange}
        label={`${task.description} done`}
      />
      <EditableText
        label="description"
        onChange={(description) => onChange({ ...task, description })}
      >
        {task.description}
      </EditableText>
      <DeleteButton onDelete={onDelete} />
    </div>
  )
}
