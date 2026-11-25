import { FormEvent, useState } from 'react';
import { TickIcon } from 'shared/icons/Tick';
import { NON_BLANK_PATTERN } from '../projects/nonBlankPattern';

type SavePatternFormProps = {
  onSave: (name: string) => void;
};

export function SavePatternForm({ onSave }: SavePatternFormProps) {
  const [name, setName] = useState('');

  const savePattern = (event: FormEvent) => {
    event.preventDefault();
    onSave(name.trim());
    setName('');
  };

  return (
    <form
      className="save-pattern-form"
      aria-label="Save pattern"
      onSubmit={savePattern}
    >
      <input
        aria-label="Pattern name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        pattern={NON_BLANK_PATTERN}
      />
      <button
        type="submit"
        className="form-action primary"
        aria-label="Save pattern"
        title="Save pattern"
      >
        <TickIcon width="16" />
      </button>
    </form>
  );
}
