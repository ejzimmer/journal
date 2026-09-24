import { format, parse } from 'date-fns';
import { useRef, useState } from 'react';
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
    format(new Date(value), 'yyyy-MM-dd'),
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
    const inputValue = inputRef.current?.value ?? '';
    const date = parse(inputValue, 'yyyy-MM-dd', new Date()).getTime();
    if (date !== value) {
      onChange(date);
    }

    stopEditing();
  };

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
          setEditingValue(format(new Date(value), 'yyyy-MM-dd'));
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
      aria-label={`Due date ${format(value, 'dd MMM')}`}
      onClick={startEditing}
      onKeyDown={openFormOnEnterOrSpace}
    >
      {format(value, 'dd MMM')}
    </div>
  );
}
