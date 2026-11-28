import { useEffect, useRef, useState } from 'react';
import { InlineEditor } from 'shared/controls/InlineEditor';
import { CalendarTask } from '../../../types';
import { CategoryCombobox } from '../../Todo/CategoryCombobox';

type DueDateTaskEditorProps = {
  task: CalendarTask;
  onChange: (task: CalendarTask) => void;
  onDelete: () => void;
  onClose: () => void;
};

export function DueDateTaskEditor({
  task,
  onChange,
  onDelete,
  onClose,
}: DueDateTaskEditorProps) {
  const descriptionRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate);

  useEffect(() => {
    descriptionRef.current?.focus();
  }, []);

  const saveChanges = () => {
    if (description === '') {
      onDelete();
      return;
    }

    const updatedTask = {
      ...task,
      description,
      dueDate: dueDate || task.dueDate,
    };
    if (
      updatedTask.description !== task.description ||
      updatedTask.dueDate !== task.dueDate
    ) {
      onChange(updatedTask);
    }
  };

  return (
    <InlineEditor
      className="today-task-description due-date-task-pill"
      onSave={saveChanges}
      onClose={onClose}
    >
      <CategoryCombobox
        value={task.category}
        onChange={(category) => {
          onChange({ ...task, category });
          onClose();
        }}
      />
      <input
        className="subtle"
        ref={descriptionRef}
        aria-label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        size={description.length}
      />
      <input
        className="subtle due-date-input"
        type="date"
        aria-label="Due date"
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
      />
    </InlineEditor>
  );
}
