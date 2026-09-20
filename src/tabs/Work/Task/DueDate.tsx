import {
  getDateFromTimestamp,
  getStartOfWeek,
  getToday,
  isAfterToday,
} from "../../../shared/dates"
import { EditableDate } from "../../../shared/controls/EditableDate"

type DueDateProps = {
  dueDate?: number
  onChange: (dueDate: number) => void
}

export function DueDate({ dueDate, onChange }: DueDateProps) {
  return dueDate ? (
    <div className={`due-date ${dueToday(dueDate)} ${dueThisWeek(dueDate)}`}>
      <EditableDate value={dueDate} onChange={onChange} />
    </div>
  ) : (
    <button
      type="button"
      className="add-metadata ghost calendar"
      style={{ fontSize: ".8em" }}
      onClick={() => onChange(new Date().getTime())}
    >
      📅
    </button>
  )
}

const dueToday = (dueDate: number) => (isAfterToday(dueDate) ? "" : "due-today")
const dueThisWeek = (dueDate: number) =>
  getStartOfWeek(getDateFromTimestamp(dueDate)).equals(
    getStartOfWeek(getToday()),
  )
    ? "due-this-week"
    : ""
