import { ReactElement } from 'react';
import { EmojiCheckbox } from 'shared/controls/EmojiCheckbox';
import { Tooltip } from 'shared/controls/Tooltip';

import './ItemSlot.css';

type BooleanGoalProps = {
  icon: string | ReactElement;
  isChecked: boolean;
  label: string;
  onChange: (isChecked: boolean) => void;
};

export function BooleanGoal({
  icon,
  isChecked,
  label,
  onChange,
}: BooleanGoalProps) {
  return (
    <li>
      <Tooltip label={label}>
        {(triggerProps) => (
          <div
            {...triggerProps}
            className={`item-slot ${isChecked ? 'done' : 'off'}`}
          >
            <EmojiCheckbox
              emoji={
                typeof icon === 'string' ? <img src={icon} alt="" /> : icon
              }
              isChecked={isChecked}
              label={label}
              onChange={() => onChange(!isChecked)}
            />
          </div>
        )}
      </Tooltip>
    </li>
  );
}
