import { EditableText } from "../../../shared/controls/EditableText"
import { DeleteButton } from "../DeleteButton"
import { Daily, TaskProps } from "../types"

import { EmojiCheckbox } from "./EmojiCheckbox"

import "./TodayTask.css"

export function TodayTask({ task, onChange, onDelete }: TaskProps<Daily>) {
  const handleStatusChange = () => {
    if (task.status !== "ready") {
      onChange({ ...task, status: "ready" })
    } else {
      onChange({ ...task, status: task.type === "毎日" ? "done" : "finished" })
    }
  }

  return (
    <>
      <EmojiCheckbox
        emoji={task.category.emoji}
        isChecked={task.status !== "ready"}
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
