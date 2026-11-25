import { ArrowRightIcon } from 'shared/icons/ArrowRight';

import './ArrowSwitch.css';

type ArrowSwitchProps = {
  label: string;
  isOn: boolean;
  isDisabled?: boolean;
  onClick: () => void;
};

export function ArrowSwitch({
  label,
  isOn,
  isDisabled,
  onClick,
}: ArrowSwitchProps) {
  return (
    <button
      role="switch"
      className="arrow-switch"
      aria-label={label}
      aria-checked={isOn}
      disabled={isDisabled}
      onClick={onClick}
    >
      <ArrowRightIcon width="14px" />
    </button>
  );
}
