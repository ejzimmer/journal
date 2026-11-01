import { CSSProperties } from 'react';
import { EditableText } from '../../../shared/controls/EditableText';
import { Tooltip } from '../../../shared/controls/Tooltip';

import './ItemSlot.css';

type CountGoalProps = {
  icon: string;
  label: string;
  value: number;
  total: number;
  onChange: (value: number) => void;
};

export function CountGoal({
  icon,
  label,
  value,
  total,
  onChange,
}: CountGoalProps) {
  const progress = `${Math.round((100 * value) / total)}%`;

  return (
    <li>
      <Tooltip
        className={`item-slot ring ${value >= total ? 'done' : ''}`}
        text={label}
        style={{ '--progress': progress } as CSSProperties}
      >
        <img src={icon} alt="" />
        <EditableText
          className="slot-count"
          label={label}
          style={{ '--digits': total.toString().length } as CSSProperties}
          value={value.toString()}
          onChange={(text) => {
            const count = Number.parseInt(text);
            if (!isNaN(count)) {
              onChange(count);
            }
          }}
        />
      </Tooltip>
    </li>
  );
}
