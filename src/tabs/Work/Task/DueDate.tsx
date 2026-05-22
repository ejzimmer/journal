import endOfDay from "date-fns/endOfDay"
import isSameWeek from "date-fns/isSameWeek"
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
      className="add-metadata ghost calendar"
      style={{ fontSize: ".8em" }}
      onClick={() => onChange(new Date().getTime())}
    >
      📅
    </button>
  )
}

const dueToday = (dueDate: number) =>
  dueDate < endOfDay(new Date()).getTime() ? "due-today" : ""
const dueThisWeek = (dueDate: number) =>
  isSameWeek(dueDate, new Date(), { weekStartsOn: 1 }) ? "due-this-week" : ""
