import { ReactElement } from 'react';
import { EmojiCheckbox } from '../../../shared/controls/EmojiCheckbox';

import './ItemSlot.css';
import { useTooltipPopover } from '../../../shared/useTooltipPopover';

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
  const { triggerProps, tooltipProps } = useTooltipPopover();

  return (
    <li className="tooltip-container" {...triggerProps}>
      <div className={`item-slot tooltip-anchor ${isChecked ? 'done' : 'off'}`}>
        <EmojiCheckbox
          emoji={typeof icon === 'string' ? <img src={icon} alt="" /> : icon}
          isChecked={isChecked}
          label={label}
          onChange={() => onChange(!isChecked)}
        />
      </div>
      <div className="tooltip" {...tooltipProps}>
        {label}
      </div>
    </li>
  );
}
