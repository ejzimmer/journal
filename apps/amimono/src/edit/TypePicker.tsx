import { useId } from 'react';

import { PROJECT_TYPES } from '../projects/projectTypes';
import { PROJECT_TYPE_KEYS, ProjectType } from '../projects/types';

type TypePickerProps = {
  type: ProjectType;
  onChange: (type: ProjectType) => void;
};

export function TypePicker({ type, onChange }: TypePickerProps) {
  const labelId = useId();

  return (
    <div className="edit-field">
      <span id={labelId} className="field-label">
        Type
      </span>
      <div className="type-picker" role="group" aria-labelledby={labelId}>
        {PROJECT_TYPE_KEYS.map((typeKey) => {
          const { label, icon } = PROJECT_TYPES[typeKey];
          return (
            <button
              key={typeKey}
              type="button"
              aria-label={label}
              title={label}
              aria-pressed={type === typeKey}
              onClick={() => onChange(typeKey)}
            >
              <img src={icon} alt="" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
