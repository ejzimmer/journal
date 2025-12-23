import { EditableText } from "../../shared/controls/EditableText"
import { DeleteButton } from "./DeleteButton"
import { WeeklyTask } from "./types"

import "./ThisWeekTask.css"
import { TickIcon } from "../../shared/icons/Tick"

export function ThisWeekTask({
  task,
  onChange,
  onDelete,
}: {
  task: WeeklyTask
  onChange: (task: WeeklyTask) => void
  onDelete: () => void
}) {
  if (!Array.isArray(task.completed)) {
    onChange({ ...task, completed: [] })
  }

  const handleDone = () => {
    if (!task.completed) {
      return
    }

    onChange({ ...task, completed: [...task.completed, Date.now()] })
  }

  const undo = () => {
    if (!task.completed) {
      return
    }

    task.completed.pop()
    onChange({ ...task, completed: [...task.completed] })
  }

  const indicators = Array.from({ length: task.frequency }).map(
    (_, index) => task.completed?.[index]
  )
  const remainder = task.completed ? task.completed.length - task.frequency : 0

  return (
    <div className="weekly-task">
      <button onClick={handleDone} className="ghost">
        <TickIcon width="16px" colour="var(--action-colour)" />
      </button>
      <EditableText
        label="description"
        onChange={(description) => onChange({ ...task, description })}
      >
        {task.description}
      </EditableText>
      <div className="indicators" onClick={undo}>
        {indicators.map((date, index) => (
          <span
            key={index}
            className={`emoji-indicator ${date ? "status-done" : ""}`}
          >
            {task.category.emoji}
          </span>
        ))}
        {remainder > 0 && <span className="remainder">+{remainder}</span>}
      </div>
      <DeleteButton onDelete={onDelete} />
    </div>
  )
}
