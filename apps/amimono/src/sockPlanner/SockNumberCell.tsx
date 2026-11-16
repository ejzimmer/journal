import { RestartArrowIcon } from 'shared/icons/RestartArrow';
import { CellInput } from './CellInput';
import {
  calculateDefaultSockNumber,
  calculateSockNumbers,
} from './sockNumbers';
import { Recipient, SockNumbers } from './types';

type SockNumberCellProps = {
  recipient: Recipient;
  field: keyof SockNumbers;
  label: string;
  step: string;
  onOverride: (value: number | null) => void;
};

export function SockNumberCell({
  recipient,
  field,
  label,
  step,
  onOverride,
}: SockNumberCellProps) {
  const value = calculateSockNumbers(recipient)[field];
  const defaultValue = calculateDefaultSockNumber(recipient, field);
  const isOverridden = recipient.overrides?.[field] !== undefined;

  const overrideNumber = (text: string) => {
    const number = Number(text);
    const isDefault = text === '' || number === defaultValue;
    onOverride(isDefault ? null : number);
  };

  return (
    <td className={`sock-number ${isOverridden ? 'overridden' : ''}`}>
      <CellInput
        type="number"
        min="0"
        step={step}
        aria-label={label}
        value={String(value)}
        onCommit={overrideNumber}
      />
      {isOverridden && (
        <button
          type="button"
          className="reset-number"
          aria-label={`Reset ${label.toLowerCase()} for ${recipient.name} to ${defaultValue}`}
          title={`Reset to ${defaultValue}`}
          onClick={() => onOverride(null)}
        >
          <RestartArrowIcon width="14" />
        </button>
      )}
    </td>
  );
}
