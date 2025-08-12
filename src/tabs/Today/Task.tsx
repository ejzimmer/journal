import { EditableText } from "../../shared/controls/EditableText"
import { Item, STATUS_KEYS, StatusKey } from "../../shared/TaskList/types"

export const STATUSES: Record<StatusKey, { text: string; action: string }> = {
  not_started: {
    text: "",
    action: "start",
  },
  in_progress: {
    text: "in progress",
    action: "finish",
  },
  done: {
    text: "done",
    action: "reset",
  },
} as const

type TaskProps = {
  task: Item
  onChange: (task: Item) => void
  onDelete: () => void
  onMoveTo: (destination: "start" | "end") => void
}

export function Task({ task, onChange, onDelete, onMoveTo }: TaskProps) {
  const taskType = task.labels?.[0]?.text ?? "chore"
  const { text: statusLabel, action } = STATUSES[task.status]

  const onStatusChange = () => {
    const currentStatusIndex = STATUS_KEYS.findIndex((s) => s === task.status)
    const status = STATUS_KEYS[(currentStatusIndex + 1) % STATUS_KEYS.length]

    onChange({ ...task, status })
  }

  const onDescriptionChange = (description: string) => {
    onChange({ ...task, description })
  }

  return (
    <>
      <button
        aria-label={`${action} ${task.description}`}
        onClick={onStatusChange}
      >
        go
      </button>
      <EditableText label="description" onChange={onDescriptionChange}>
        {task.description}
      </EditableText>{" "}
      ({taskType}){statusLabel ? ` - ${statusLabel}` : ""}
      <button aria-label={`delete ${task.description}`} onClick={onDelete}>
        x
      </button>
      <button
        aria-label={`move ${task.description} to start`}
        onClick={() => onMoveTo("start")}
      >
        x
      </button>
      <button
        aria-label={`move ${task.description} to end`}
        onClick={() => onMoveTo("end")}
      >
        x
      </button>
    </>
  )
}
