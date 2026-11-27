import { ArrowRightIcon } from '../icons/ArrowRight';

import './ArrowCheckbox.css';
import './litIcon.css';

type ArrowCheckboxProps = {
  label: string;
  isChecked: boolean;
  isDisabled?: boolean;
  onChange: (isChecked: boolean) => void;
};

export function ArrowCheckbox({
  label,
  isChecked,
  isDisabled,
  onChange,
}: ArrowCheckboxProps) {
  return (
    <label className="arrow-checkbox">
      <input
        type="checkbox"
        className="hidden"
        aria-label={label}
        checked={isChecked}
        disabled={isDisabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <ArrowRightIcon
        width="14px"
        className={isChecked ? 'lit-icon' : undefined}
      />
    </label>
  );
}
