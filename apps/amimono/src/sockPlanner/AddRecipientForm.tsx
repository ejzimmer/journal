import { FormEvent, useState } from 'react';
import { PlusIcon } from 'shared/icons/Plus';
import { NON_BLANK_PATTERN } from '../projects/nonBlankPattern';
import { convertToEuSize, SIZE_SYSTEMS, SizeSystem } from './sizeConversion';

import './AddRecipientForm.css';

type AddRecipientFormProps = {
  onAdd: (name: string, euSize: number) => void;
};

export function AddRecipientForm({ onAdd }: AddRecipientFormProps) {
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [sizeSystem, setSizeSystem] = useState<SizeSystem>('eu');

  const euSize =
    size === '' ? undefined : convertToEuSize(Number(size), sizeSystem);

  const addRecipient = (event: FormEvent) => {
    event.preventDefault();
    if (euSize === undefined) return;
    onAdd(name.trim(), euSize);
    setName('');
    setSize('');
  };

  return (
    <form
      className="add-recipient-form"
      aria-label="New person"
      onSubmit={addRecipient}
    >
      <input
        aria-label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        pattern={NON_BLANK_PATTERN}
      />
      <input
        aria-label="Size"
        type="number"
        min="0"
        step="0.5"
        value={size}
        onChange={(event) => setSize(event.target.value)}
        required
      />
      <select
        aria-label="Sizing system"
        value={sizeSystem}
        onChange={(event) => setSizeSystem(event.target.value as SizeSystem)}
      >
        {Object.entries(SIZE_SYSTEMS).map(([system, label]) => (
          <option key={system} value={system}>
            {label}
          </option>
        ))}
      </select>
      {sizeSystem !== 'eu' && euSize !== undefined && (
        <output className="eu-size">EU {euSize}</output>
      )}
      <button
        type="submit"
        className="form-action primary"
        aria-label="Add person"
        title="Add person"
      >
        <PlusIcon width="16" strokeWidth="3" />
      </button>
    </form>
  );
}
