import { KeyboardEvent, useEffect, useRef, useState } from 'react';
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

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      saveChanges();
    }

    if (['Enter', 'Escape'].includes(event.key)) {
      // onClose swaps this editor for the description button and focuses
      // it before this keydown ends, so Enter would then click the button.
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="today-task-description has-end-control weekly-task-pill"
      onKeyDown={handleKeyDown}
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
    </div>
  );
}
