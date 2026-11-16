import { Combobox } from 'shared/controls/combobox/Combobox';

import { PROJECT_TYPES } from '../projects/projectTypes';
import { PROJECT_TYPE_KEYS, ProjectType } from '../projects/types';
import { TypeOption, TypeOptionLabel } from './TypeOptionLabel';

import './TypePicker.css';

const TYPE_OPTIONS: TypeOption[] = PROJECT_TYPE_KEYS.map((id) => ({
  id,
  label: PROJECT_TYPES[id].label,
}));

type TypePickerProps = {
  type: ProjectType;
  onChange: (type: ProjectType) => void;
  hideLabel?: boolean;
};

export function TypePicker({ type, onChange, hideLabel }: TypePickerProps) {
  return (
    <div className="edit-field type-picker">
      <Combobox
        {...(hideLabel ? { ariaLabel: 'Type' } : { label: 'Type' })}
        value={TYPE_OPTIONS.find((option) => option.id === type)}
        options={TYPE_OPTIONS}
        onChange={(option) => onChange(option.id)}
        Option={TypeOptionLabel}
        Value={TypeOptionLabel}
      />
    </div>
  );
}
