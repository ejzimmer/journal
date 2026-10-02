import { FormEvent, useState } from 'react';
import { PlusIcon } from '../../shared/icons/Plus';
import { useFormToggle } from '../../shared/controls/useFormToggle';

export function AddExercise({ onAdd }: { onAdd: (name: string) => void }) {
  const { isFormOpen, triggerRef, openForm, closeForm } = useFormToggle();
  const [name, setName] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }

    onAdd(name.trim());
    setName('');
    closeForm();
  };

  return isFormOpen ? (
    <form
      className="new-exercise"
      aria-label="Add exercise"
      onSubmit={handleSubmit}
      onKeyDown={(event) => event.key === 'Escape' && closeForm()}
    >
      <input
        aria-label="Exercise name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
      />
    </form>
  ) : (
    <button
      ref={triggerRef}
      className="add-exercise"
      aria-label="Add exercise"
      onClick={openForm}
    >
      <PlusIcon strokeWidth="3" />
    </button>
  );
}
