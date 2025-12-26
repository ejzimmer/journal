import { EditableText } from "../../../shared/controls/EditableText"
import { DeleteButton } from "../DeleteButton"
import { Task } from "../types"

import { EmojiCheckbox } from "./EmojiCheckbox"

import "./TodayTask.css"

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
    <>
      <EmojiCheckbox
        emoji={task.category.emoji}
        isChecked={task.status === "done" || task.status === "finished"}
        onChange={handleStatusChange}
        label={`${task.description} done`}
      />
      <div style={{ flexGrow: 1 }}>
        <EditableText
          label="description"
          onChange={(description) => onChange({ ...task, description })}
        >
          {task.description}
        </EditableText>
      </div>
      <DeleteButton onDelete={onDelete} />
    </>
  )
}
