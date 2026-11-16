import { InputHTMLAttributes, KeyboardEvent, useState } from 'react';

type CellInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  value: string;
  onCommit: (value: string) => void;
};

export function CellInput({ value, onCommit, ...inputProps }: CellInputProps) {
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  if (syncedValue !== value) {
    setSyncedValue(value);
    setDraft(value);
  }

  const commitDraft = () => {
    if (draft.trim() === value) return;
    onCommit(draft.trim());
  };

  const commitOrCancel = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      commitDraft();
    } else if (event.key === 'Escape') {
      setDraft(value);
    }
  };

  return (
    <input
      className="cell-input"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commitDraft}
      onKeyDown={commitOrCancel}
      {...inputProps}
    />
  );
}
