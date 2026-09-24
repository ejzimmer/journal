import { useRef, useState } from 'react';
import { TickIcon } from '../../shared/icons/Tick';
import { XIcon } from '../../shared/icons/X';
import { LabelTags } from './LabelTags';
import { DueDate } from './Task/DueDate';
import { UpdateLabels } from './Task/UpdateLabels';
import { Colour, Label } from './types';

type NewTask = {
  description: string;
  dueDate?: number;
  labels: Label[];
};

type AddTaskFormProps = {
  onSubmit: (task: NewTask) => void;
  onClose: () => void;
};

export function AddTaskForm({ onSubmit, onClose }: AddTaskFormProps) {
  const descriptionRef = useRef<HTMLInputElement>(null);
  const [dueDate, setDueDate] = useState<number>();
  const [labels, setLabels] = useState<Label[]>([]);

  const handleCancel = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const description = descriptionRef.current?.value;
    if (!description) {
      return;
    }

    const task: NewTask = {
      description,
      labels,
    };

    if (dueDate) {
      task.dueDate = dueDate;
    }

    onSubmit(task);
    onClose();
  };

  const changeColour = (value: string, colour: Colour) =>
    setLabels(
      labels.map((label) =>
        label.value === value ? { ...label, colour } : label,
      ),
    );

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleCancel} className="add-task">
      <input
        aria-label="Description"
        ref={descriptionRef}
        className="description"
        autoFocus
      />
      <LabelTags
        labels={labels.map((label) => ({ ...label, id: label.value }))}
        onRemoveLabel={(value) =>
          setLabels(labels.filter((label) => label.value !== value))
        }
        onChangeColour={changeColour}
      />
      <UpdateLabels labels={labels} onChangeLabels={setLabels} />
      <DueDate dueDate={dueDate} onChange={setDueDate} />
      <button
        aria-label="submit"
        className="icon outline"
        style={{ color: 'var(--success-colour)' }}
      >
        <TickIcon />
      </button>
      <button
        type="button"
        aria-label="cancel"
        className="icon outline"
        style={{ color: 'var(--danger-colour-dark)' }}
        onClick={onClose}
      >
        <XIcon />
      </button>
    </form>
  );
}
