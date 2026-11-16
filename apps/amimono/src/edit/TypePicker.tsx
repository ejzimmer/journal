import { useId } from 'react';

import { PROJECT_TYPES } from '../projects/projectTypes';
import { PROJECT_TYPE_KEYS, ProjectType } from '../projects/types';

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
      >
        {PROJECT_TYPE_KEYS.map((typeKey) => (
          <option key={typeKey} value={typeKey}>
            {PROJECT_TYPES[typeKey].label}
          </option>
        ))}
      </select>
    </div>
  );
}
