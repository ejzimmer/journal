import { useId } from 'react';
import { Switch } from 'shared/controls/Switch';

import { CRAFTS } from '../projects/crafts';
import { Craft } from '../projects/types';

const NO_CRAFT = 'none';
type CraftOption = Craft | typeof NO_CRAFT;
const CRAFT_OPTIONS: CraftOption[] = [
  NO_CRAFT,
  ...(Object.keys(CRAFTS) as Craft[]),
];

type CraftPickerProps = {
  craft?: Craft;
  onChange: (craft?: Craft) => void;
};

export function CraftPicker({ craft, onChange }: CraftPickerProps) {
  const name = useId();

  return (
    <fieldset className="edit-field">
      <legend className="field-label">Craft</legend>
      <Switch
        options={CRAFT_OPTIONS}
        value={craft ?? NO_CRAFT}
        onChange={(option) =>
          onChange(option === NO_CRAFT ? undefined : option)
        }
        name={name}
        Option={CraftOptionLabel}
        className="craft-picker"
      />
    </fieldset>
  );
}

function CraftOptionLabel({ value }: { value: CraftOption }) {
  if (value === NO_CRAFT) {
    return (
      <span className="craft-option" title="None">
        <span aria-hidden="true">–</span>
        <span className="visually-hidden">None</span>
      </span>
    );
  }

  const { label, Icon } = CRAFTS[value];
  return (
    <span className="craft-option" title={label}>
      <Icon />
      <span className="visually-hidden">{label}</span>
    </span>
  );
}
