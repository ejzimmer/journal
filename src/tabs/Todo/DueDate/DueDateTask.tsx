import { useContext } from "react"
import { EditableDate } from "../../../shared/controls/EditableDate"
import { EditableText } from "../../../shared/controls/EditableText"
import { DeleteButton } from "../DeleteButton"
import { EmojiCheckbox } from "../Today/EmojiCheckbox"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { CalendarTask, PARENT_LIST } from "./types"

export function DueDateTask({ task }: { task: CalendarTask }) {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("Missing Firebase context provider")
  }

  const onChange = (task: CalendarTask) => context.updateItem(PARENT_LIST, task)
  const onDelete = () => context.deleteItem(PARENT_LIST, task)

  return (
    <>
      <EmojiCheckbox
        emoji={task.category.emoji}
        isChecked={task.status === "finished"}
        onChange={() =>
          onChange({
            ...task,
            status: task.status === "finished" ? "ready" : "finished",
          })
        }
        label={`${task.description} finished`}
      />
      <div className="description">
        <EditableText
          label="description"
          onChange={(description) => onChange({ ...task, description })}
        >
          {task.description}
        </EditableText>
      </div>
      <div className={`due-date ${task.dueDate < Date.now() ? "overdue" : ""}`}>
        <EditableDate
          value={task.dueDate}
          onChange={(date) => onChange({ ...task, dueDate: date })}
        />
      </div>
      <DeleteButton onDelete={onDelete} />
    </>
  )
}
