import { EditableText } from "../../../shared/controls/EditableText"
import { DeleteButton } from "../DeleteButton"
import { TaskProps, Weekly } from "../types"

import "./ThisWeekTask.css"

export function ThisWeekTask({ task, onChange, onDelete }: TaskProps<Weekly>) {
  if (!Array.isArray(task.completed)) {
    onChange({ ...task, completed: [] })
  }

  const handleClick = (event: React.MouseEvent) => {
    if (!task.completed) {
      return
    }

    if (event.shiftKey) {
      task.completed.pop()
      onChange({ ...task, completed: [...task.completed] })
    } else {
      onChange({ ...task, completed: [...task.completed, Date.now()] })
    }
  }

  const numberDone = (task.completed?.filter((date) => !!date) ?? []).length
  const remainder = Math.max(numberDone - task.frequency, 0)
  const percent = (1 / task.frequency) * 100

  return (
    <>
      <button onClick={handleClick} className="icon subtle">
        {task.category.emoji}
      </button>
      <div style={{ flexGrow: 1 }}>
        <EditableText
          label="description"
          onChange={(description) => onChange({ ...task, description })}
        >
          {task.description}
        </EditableText>
      </div>
      <div className="indicators">
        <progress
          max={task.frequency}
          value={numberDone}
          style={{
            background: `repeating-linear-gradient(to right, transparent, transparent ${percent}%, var(--body-colour-light) ${percent}%, var(--body-colour-light) calc(${percent}% + 1px))`,
          }}
        />
        {remainder > 0 && <span className="remainder">+{remainder}</span>}
      </div>
      <DeleteButton onDelete={onDelete} />
    </>
  )
}
