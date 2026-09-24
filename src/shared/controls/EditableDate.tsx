import { useRef, useState } from 'react';
import {
  formatDayAndMonth,
  getDateFromTimestamp,
  getTimestampFromDate,
} from '../dates';
import { useFormToggle } from './useFormToggle';

interface Props extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'style' | 'onChange'
> {
  onChange: (date: number) => void;
  value: number;
}

export function EditableDate({ onChange, value, ...props }: Props) {
  const [editingValue, setEditingValue] = useState(
    getDateFromTimestamp(value).toString(),
  );
  const {
    isFormOpen: isEditing,
    triggerRef: displayRef,
    openForm: startEditing,
    closeForm: stopEditing,
    openFormOnEnterOrSpace,
  } = useFormToggle<HTMLDivElement>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const inputValue = inputRef.current?.value;
    if (inputValue) {
      const date = getTimestampFromDate(Temporal.PlainDate.from(inputValue));
      if (date !== value) {
        onChange(date);
      }
    }

    stopEditing();
  };

  const displayedDate = formatDayAndMonth(getDateFromTimestamp(value));

  return isEditing ? (
    <input
      type="date"
      ref={inputRef}
      autoFocus
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          handleSubmit();
        }

        if (event.key === 'Escape') {
          event.stopPropagation();
          setEditingValue(getDateFromTimestamp(value).toString());
          stopEditing();
        }
      }}
      value={editingValue}
      onChange={(event) => setEditingValue(event.target.value)}
      aria-label="Due date"
      {...props}
    />
  ) : (
    <div
      {...props}
      ref={displayRef}
      role="button"
      tabIndex={0}
      aria-label={`Due date ${displayedDate}`}
      onClick={startEditing}
      onKeyDown={openFormOnEnterOrSpace}
    >
      {displayedDate}
    </div>
  );
}
