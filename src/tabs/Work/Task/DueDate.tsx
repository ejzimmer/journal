import { EditableDate } from "../../../shared/controls/EditableDate"

type DueDateProps = {
  dueDate?: number
  onChange: (dueDate: number) => void
}

export function DueDate({ dueDate, onChange }: DueDateProps) {
  return dueDate ? (
    <div className="due-date">
      <EditableDate value={dueDate} onChange={onChange} />
    </div>
  ) : (
    <button
      className="add-metadata ghost calendar"
      style={{ fontSize: ".8em" }}
      onClick={() => onChange(new Date().getTime())}
    >
      📅
    </button>
  )
}
