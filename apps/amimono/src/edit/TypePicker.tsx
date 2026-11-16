import { useId } from 'react';
import { Switch } from 'shared/controls/Switch';

import { PROJECT_TYPES } from '../projects/projectTypes';
import { PROJECT_TYPE_KEYS, ProjectType } from '../projects/types';

type TypePickerProps = {
  type: ProjectType;
  onChange: (type: ProjectType) => void;
};

export function TypePicker({ type, onChange }: TypePickerProps) {
  const name = useId();

  return (
    <fieldset className="edit-field">
      <legend className="field-label">Type</legend>
      <Switch
        options={[...PROJECT_TYPE_KEYS]}
        value={type}
        onChange={onChange}
        name={name}
        Option={TypeOptionLabel}
        className="type-picker"
      />
    </fieldset>
  );
}

function TypeOptionLabel({ value }: { value: ProjectType }) {
  const { label, icon } = PROJECT_TYPES[value];
  return (
    <span className="type-option" title={label}>
      <img src={icon} alt={label} />
    </span>
  );
}
