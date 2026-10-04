import { useState } from 'react';
import { TickIcon } from '../../shared/icons/Tick';

type AddSubtaskFormProps = {
  isFormVisible: boolean;
  onAddSubtask: (description: string) => void;
};

export function AddSubtaskForm({
  isFormVisible,
  onAddSubtask,
}: AddSubtaskFormProps) {
  const [description, setDescription] = useState('');

  return (
    <form
      className={`add-subtask-form ${isFormVisible ? 'visible' : ''}`}
      onSubmit={(event) => {
        event.preventDefault();

        const trimmedDescription = description.trim();
        if (!trimmedDescription) {
          return;
        }

        onAddSubtask(trimmedDescription);
        setDescription('');
      }}
    >
      <input
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        disabled={!isFormVisible}
        required
      />
      <button className="ghost" disabled={!isFormVisible}>
        <TickIcon width="16px" colour="var(--action-colour)" />
      </button>
    </form>
  );
}
