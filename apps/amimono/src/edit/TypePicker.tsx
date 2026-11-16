import { useId } from 'react';

import { PROJECT_TYPE_KEYS, ProjectType } from '../projects/types';
import { TypeOptionLabel } from './TypeOptionLabel';

type TypePickerProps = {
  type: ProjectType;
  onChange: (type: ProjectType) => void;
};

export function TypePicker({ type, onChange }: TypePickerProps) {
  const id = useId();

  return (
    <div className="edit-field">
      <label htmlFor={id} className="field-label">
        Type
      </label>
      <select
        id={id}
        value={type}
        onChange={(event) => onChange(event.target.value as ProjectType)}
        className="type-picker"
      >
        <button type="button">
          <TypeOptionLabel type={type} />
        </button>
        {PROJECT_TYPE_KEYS.map((typeKey) => (
          <option key={typeKey} value={typeKey}>
            <TypeOptionLabel type={typeKey} />
          </option>
        ))}
      </select>
    </div>
  );
}
