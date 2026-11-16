import { useId } from 'react';
import { Switch } from 'shared/controls/Switch';

import { CRAFTS } from '../projects/crafts';
import { Craft } from '../projects/types';

import './CraftPicker.css';

const CRAFT_OPTIONS = Object.keys(CRAFTS) as Craft[];

type CraftPickerProps = {
  craft?: Craft;
  onChange: (craft: Craft) => void;
  hideLabel?: boolean;
};

export function CraftPicker({ craft, onChange, hideLabel }: CraftPickerProps) {
  const name = useId();

  return (
    <fieldset className="edit-field">
      <legend className={hideLabel ? 'visually-hidden' : 'field-label'}>
        Craft
      </legend>
      <Switch
        options={CRAFT_OPTIONS}
        value={craft}
        onChange={onChange}
        name={name}
        Option={CraftOptionLabel}
        className="craft-picker"
      />
    </fieldset>
  );
}

function CraftOptionLabel({ value }: { value: Craft }) {
  const { label, Icon } = CRAFTS[value];
  return (
    <span className="craft-option" title={label}>
      <Icon />
      <span className="visually-hidden">{label}</span>
    </span>
  );
}
