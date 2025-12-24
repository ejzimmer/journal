import { EditableDate } from "../../../shared/controls/EditableDate"
import { EditableText } from "../../../shared/controls/EditableText"
import { DeleteButton } from "../DeleteButton"
import { CalendarTask } from "../types"

export function DueDateTask({
  task,
  onChange,
  onDelete,
}: {
  task: CalendarTask
  onChange: (task: CalendarTask) => void
  onDelete: () => void
}) {
  return (
    <>
      <input
        type="checkbox"
        onChange={() => onChange({ ...task, status: "finished" })}
        checked={task.status === "done" || task.status === "finished"}
      />
      <div
        style={{
          color:
            task.dueDate < Date.now() ? "var(--error-colour)" : "currentcolor",
          border: "2px solid",
          fontSize: "1rem",
          fontWeight: "bold",
        }}
      >
        <EditableDate
          value={task.dueDate}
          onChange={(date) => onChange({ ...task, dueDate: date })}
        />
      </div>
      {task.category.emoji}
      <EditableText
        label="description"
        onChange={(description) => onChange({ ...task, description })}
      >
        {task.description}
      </EditableText>
      <DeleteButton onDelete={onDelete} />
    </>
  )
}
