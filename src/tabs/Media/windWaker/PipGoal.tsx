import { Tooltip } from '../../../shared/controls/Tooltip';

import './ItemSlot.css';

type PipGoalProps = {
  icon: string;
  label: string;
  level: number;
  levels: number;
  onChange: (level: number) => void;
};

export function PipGoal({
  icon,
  label,
  level,
  levels,
  onChange,
}: PipGoalProps) {
  return (
    <li className="pip-goal">
      <Tooltip
        className={`item-slot ${level >= levels ? 'done' : ''}`}
        text={label}
      >
        <img src={icon} alt="" />
      </Tooltip>
      <div className="pips">
        {Array.from({ length: levels }, (_, index) => {
          const pipLevel = index + 1;
          return (
            <button
              key={pipLevel}
              className={`pip ${pipLevel <= level ? 'on' : ''}`}
              aria-label={`${label} ${pipLevel} of ${levels}`}
              aria-pressed={pipLevel <= level}
              onClick={() =>
                onChange(pipLevel === level ? pipLevel - 1 : pipLevel)
              }
            />
          );
        })}
      </div>
    </li>
  );
}
