import { ReactElement } from 'react';
import { EmojiCheckbox } from '../../../shared/controls/EmojiCheckbox';

import './ItemSlot.css';

export function BooleanGoal({
  icon,
  isChecked,
  label,
  onChange,
}: {
  icon: string | ReactElement;
  isChecked: boolean;
  label: string;
  onChange: (isChecked: boolean) => void;
}) {
  return (
    <li className="tooltip-container">
      <div className={`item-slot tooltip-anchor ${isChecked ? 'done' : 'off'}`}>
        <EmojiCheckbox
          emoji={typeof icon === 'string' ? <img src={icon} alt="" /> : icon}
          isChecked={isChecked}
          label={label}
          onChange={() => onChange(!isChecked)}
        />
      </div>
      <div className="tooltip">{label}</div>
    </li>
  );
}
