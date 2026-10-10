import { useFormToggle } from '../../../shared/controls/useFormToggle';
import { CalendarIcon } from '../../../shared/icons/Calendar';
import { PlannedDate } from './PlannedDate';

type PlannedDateFieldProps = {
  date?: string;
  isDone: boolean;
  onChange: (date: string) => void;
};

export function PlannedDateField({
  date,
  isDone,
  onChange,
}: PlannedDateFieldProps) {
  const { isFormOpen, triggerRef, openForm, closeForm } = useFormToggle();

  const saveDate = (newDate: string) => {
    if (newDate !== (date ?? '')) {
      onChange(newDate);
    }
    closeForm();
  };

  if (isFormOpen) {
    return (
      <input
        type="date"
        className="planned-date-input"
        aria-label="Planned date"
        autoFocus
        defaultValue={date}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            saveDate(event.currentTarget.value);
          }
          if (event.key === 'Escape') {
            closeForm();
          }
        }}
        onBlur={(event) => saveDate(event.currentTarget.value)}
      />
    );
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      className={date ? 'planned-date-button' : 'ghost add-planned-date'}
      aria-label={date ? 'Change planned date' : 'Add planned date'}
      onClick={openForm}
    >
      {date ? <PlannedDate date={date} isDone={isDone} /> : <CalendarIcon />}
    </button>
  );
}
