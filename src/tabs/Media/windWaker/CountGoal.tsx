import { CSSProperties } from 'react';
import { EditableText } from '../../../shared/controls/EditableText';

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
    <li className="tooltip-container">
      <div
        className={`item-slot ring tooltip-anchor ${value >= total ? 'done' : ''}`}
        style={{ '--progress': progress } as CSSProperties}
      >
        {icon.startsWith('.') ? (
          <img src={icon} alt="" />
        ) : (
          <span className="slot-emoji">{icon}</span>
        )}
        <EditableText
          className="slot-count"
          label={label}
          value={value.toString()}
          onChange={(text) => {
            const count = Number.parseInt(text);
            if (!isNaN(count)) {
              onChange(count);
            }
          }}
        />
      </div>
      <div className="tooltip">{label}</div>
    </li>
  );
}
