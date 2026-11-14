import { useId } from 'react';

import { CRAFTS } from '../projects/crafts';
import { Craft } from '../projects/types';

type CraftPickerProps = {
  craft?: Craft;
  onChange: (craft?: Craft) => void;
};

export function CraftPicker({ craft, onChange }: CraftPickerProps) {
  const labelId = useId();

  return (
    <div className="edit-field">
      <span id={labelId} className="field-label">
        Craft
      </span>
      <div className="craft-picker" role="group" aria-labelledby={labelId}>
        {(Object.keys(CRAFTS) as Craft[]).map((craftKey) => {
          const { label, Icon } = CRAFTS[craftKey];
          const isSelected = craft === craftKey;
          return (
            <button
              key={craftKey}
              type="button"
              aria-label={label}
              title={label}
              aria-pressed={isSelected}
              onClick={() => onChange(isSelected ? undefined : craftKey)}
            >
              <Icon />
            </button>
          );
        })}
      </div>
    </div>
  );
}
