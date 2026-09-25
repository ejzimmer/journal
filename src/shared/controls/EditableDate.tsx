import { useRef, useState } from 'react';
import { formatDayAndMonth, getPlainDate, StoredDate } from '../dates';
import { useFormToggle } from './useFormToggle';

interface Props extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'style' | 'onChange'
> {
  onChange: (date: string) => void;
  value: StoredDate;
}

export function EditableDate({ onChange, value, ...props }: Props) {
  const currentDate = getPlainDate(value).toString();
  const [editingValue, setEditingValue] = useState(currentDate);
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
    if (inputValue && inputValue !== currentDate) {
      onChange(inputValue);
    }

    stopEditing();
  };

  const displayedDate = formatDayAndMonth(value);

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
          setEditingValue(currentDate);
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
