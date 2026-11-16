import { FormEvent, useId, useState } from 'react';

import { PlusIcon } from 'shared/icons/Plus';

type AddSubtaskFormProps = {
  onAdd: (description: string) => void;
};

export function AddSubtaskForm({ onAdd }: AddSubtaskFormProps) {
  const inputId = useId();
  const [description, setDescription] = useState('');

  const addSubtask = (event: FormEvent) => {
    event.preventDefault();
    const trimmedDescription = description.trim();
    if (!trimmedDescription) return;
    onAdd(trimmedDescription);
    setDescription('');
  };

  return (
    <form className="add-subtask-form" onSubmit={addSubtask}>
      <label htmlFor={inputId}>New step</label>
      <input
        id={inputId}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <button type="submit" aria-label="Add step" title="Add step">
        <PlusIcon width="14" />
      </button>
    </form>
  );
}
