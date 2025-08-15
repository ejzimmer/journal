import { CSSProperties } from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { Item, STATUS_KEYS, StatusKey } from "../../shared/TaskList/types"
import { isCategory } from "../../shared/TodoList/types"

import "./Task.css"
import { MoveMenu, MoveMenuProps } from "./MoveMenu"
import { DeleteTaskButton } from "./DeleteTaskButton"
import { PlayButtonIcon } from "../../shared/icons/PlayButton"
import { StopWatchIcon } from "../../shared/icons/StopWatch"
import { RestartArrowIcon } from "../../shared/icons/RestartArrow"

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
  onMoveTo: MoveMenuProps["onMoveTo"]
}

export function Task({ task, onChange, onDelete, onMoveTo }: TaskProps) {
  const firstLabel = task.labels?.[0]
  const taskType = isCategory(firstLabel?.text) ? firstLabel.text : "🧹"
  const { text: statusLabel, action } = STATUSES[task.status]

  const onStatusChange = () => {
    const currentStatusIndex = STATUS_KEYS.findIndex((s) => s === task.status)
    const status = STATUS_KEYS[(currentStatusIndex + 1) % STATUS_KEYS.length]

    onChange({ ...task, status })
  }

  const onDescriptionChange = (description: string) => {
    onChange({ ...task, description })
  }

  const style = { "--background": firstLabel?.colour } as CSSProperties

  return (
    <div className={`daily-task ${task.status}`} style={style}>
      <MoveMenu onMoveTo={onMoveTo} description={task.description} />

      <button
        aria-label={`${action} ${task.description}`}
        onClick={onStatusChange}
        className="ghost"
      >
        {task.status === "not_started" ? (
          <PlayButtonIcon width="20px" colour="hsl(0 0% 50%)" />
        ) : task.status === "in_progress" ? (
          <StopWatchIcon width="20px" colour="hsl(0 0% 20%)" />
        ) : (
          <RestartArrowIcon width="20px" colour="hsl(0 0% 50%)" />
        )}
      </button>
      <div style={{ marginInlineStart: "5px" }}>{taskType}</div>
      <div style={{ flexGrow: 1 }}>
        <EditableText
          label="description"
          onChange={onDescriptionChange}
          className="title"
        >
          {task.description}
        </EditableText>{" "}
        <div style={{ visibility: "hidden", width: 0, height: 0 }}>
          {statusLabel ? ` - ${statusLabel}` : ""}
        </div>
      </div>
      <DeleteTaskButton
        description={`${taskType} ${task.description}`}
        onDelete={onDelete}
      />
    </div>
  )
}
