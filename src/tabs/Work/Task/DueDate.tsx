import {
  getToday,
  isAfterToday,
  isThisWeek,
  StoredDate,
} from '../../../shared/dates';
import { EditableDate } from '../../../shared/controls/EditableDate';

type DueDateProps = {
  dueDate?: StoredDate;
  onChange: (dueDate: string) => void;
};

export function DueDate({ dueDate, onChange }: DueDateProps) {
  return dueDate ? (
    <div className={`due-date ${dueToday(dueDate)} ${dueThisWeek(dueDate)}`}>
      <EditableDate value={dueDate} onChange={onChange} />
    </div>
  ) : (
    <button
      type="button"
      className="add-metadata ghost calendar"
      style={{ fontSize: '.8em' }}
      onClick={() => onChange(getToday())}
    >
      📅
    </button>
  );
}

const dueToday = (dueDate: StoredDate) =>
  isAfterToday(dueDate) ? '' : 'due-today';
const dueThisWeek = (dueDate: StoredDate) =>
  isThisWeek(dueDate) ? 'due-this-week' : '';
