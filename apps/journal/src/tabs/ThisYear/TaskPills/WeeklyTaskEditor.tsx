import { useEffect, useRef, useState } from 'react';
import { InlineEditor } from 'shared/controls/InlineEditor';
import { WeeklyTask } from '../../../types';
import { CategoryCombobox } from '../../Todo/CategoryCombobox';

type WeeklyTaskEditorProps = {
  task: WeeklyTask;
  onChange: (task: WeeklyTask) => void;
  onDelete: () => void;
  onClose: () => void;
};

export function WeeklyTaskEditor({
  task,
  onChange,
  onDelete,
  onClose,
}: WeeklyTaskEditorProps) {
  const descriptionRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState(task.description);
  const [frequency, setFrequency] = useState(String(task.frequency));

  useEffect(() => {
    descriptionRef.current?.focus();
  }, []);

  const saveChanges = () => {
    if (description === '') {
      onDelete();
      return;
    }

    const newFrequency = Number.parseInt(frequency);
    const updatedTask = {
      ...task,
      description,
      frequency: isNaN(newFrequency) ? task.frequency : newFrequency,
    };
    if (
      updatedTask.description !== task.description ||
      updatedTask.frequency !== task.frequency
    ) {
      onChange(updatedTask);
    }
  };

  return (
    <InlineEditor
      className="today-task-description weekly-task-pill"
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
        className="subtle weekly-frequency"
        type="number"
        min={1}
        aria-label="Frequency"
        value={frequency}
        onChange={(event) => setFrequency(event.target.value)}
      />
    </InlineEditor>
  );
}
