import { useId } from 'react';
import { ArrowDownIcon } from '../../../shared/icons/ArrowDown';
import { ArrowUpIcon } from '../../../shared/icons/ArrowUp';
import { SockDirection } from '../../../shared/types';

const DIRECTIONS = [
  { direction: 'cuff_down', label: 'Cuff down', Icon: ArrowDownIcon },
  { direction: 'toe_up', label: 'Toe up', Icon: ArrowUpIcon },
] as const;

type DirectionSwitchProps = {
  value: SockDirection;
  onChange: (direction: SockDirection) => void;
};

export function DirectionSwitch({ value, onChange }: DirectionSwitchProps) {
  const name = useId();

  return (
    <fieldset className="sock-direction" aria-label="Knitting direction">
      {DIRECTIONS.map(({ direction, label, Icon }) => (
        <label key={direction} title={label}>
          <input
            type="radio"
            name={name}
            value={direction}
            aria-label={label}
            checked={value === direction}
            onChange={() => onChange(direction)}
          />
          <Icon width="12px" />
        </label>
      ))}
    </fieldset>
  );
}
