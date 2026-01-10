import { useContext } from "react"
import { EditableText } from "../../../shared/controls/EditableText"
import { DeleteButton } from "../DeleteButton"

import "./ThisWeekTask.css"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { PARENT_LIST, WeeklyTask } from "./types"

export function ThisWeekTask({ task }: { task: WeeklyTask }) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const onChange = (task: WeeklyTask) => {
    storageContext.updateItem<WeeklyTask>(PARENT_LIST, task)
  }

  const handleClick = (event: React.MouseEvent) => {
    if (!task.completed) {
      task.completed = []
    }

    if (event.shiftKey) {
      task.completed.pop()
      onChange({ ...task, completed: [...task.completed] })
    } else {
      onChange({
        ...task,
        completed: [...task.completed.filter(Boolean), Date.now()],
      })
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
          className={numberDone === task.frequency ? "full" : ""}
          style={{
            backgroundColor: "#eee",
            backgroundImage: `repeating-linear-gradient(to right, transparent, transparent ${percent}%, var(--body-colour-light) ${percent}%, var(--body-colour-light) calc(${percent}% + 1px))`,
          }}
        />
        {remainder > 0 && <span className="remainder">+{remainder}</span>}
      </div>
      <DeleteButton
        onDelete={() =>
          storageContext.deleteItem<WeeklyTask>(PARENT_LIST, task)
        }
      />
    </>
  )
}
