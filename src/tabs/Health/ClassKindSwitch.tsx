import { useId } from 'react';
import { SquareGridIcon } from '../../shared/icons/SquareGrid';
import { StackedBarsIcon } from '../../shared/icons/StackedBars';

export type ClassKind = 'set' | 'weekly';

const CLASS_KINDS = [
  { kind: 'set', label: 'Set number of classes', Icon: SquareGridIcon },
  { kind: 'weekly', label: 'Weekly classes', Icon: StackedBarsIcon },
] as const;

type ClassKindSwitchProps = {
  value: ClassKind;
  onChange: (kind: ClassKind) => void;
};

export function ClassKindSwitch({ value, onChange }: ClassKindSwitchProps) {
  const name = useId();

  return (
    <fieldset className="class-kind-switch" aria-label="Kind of class">
      {CLASS_KINDS.map(({ kind, label, Icon }) => (
        <label key={kind} title={label}>
          <input
            type="radio"
            name={name}
            value={kind}
            aria-label={label}
            checked={value === kind}
            onChange={() => onChange(kind)}
          />
          <Icon />
        </label>
      ))}
    </fieldset>
  );
}
