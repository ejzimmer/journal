import { FormEvent, useState } from 'react';

import { PlusIcon } from 'shared/icons/Plus';

type AddSubtaskFormProps = {
  onAdd: (description: string) => void;
};

export function AddSubtaskForm({ onAdd }: AddSubtaskFormProps) {
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
      <input
        aria-label="New subtask"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <button
        type="submit"
        className="round-button"
        aria-label="Add subtask"
        title="Add subtask"
      >
        <PlusIcon width="14" />
      </button>
    </form>
  );
}
