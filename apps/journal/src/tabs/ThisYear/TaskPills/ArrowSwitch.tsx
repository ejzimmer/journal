import { ArrowRightIcon } from 'shared/icons/ArrowRight';

import 'shared/controls/litIcon.css';
import './ArrowSwitch.css';

type ArrowSwitchProps = {
  label: string;
  isOn: boolean;
  isDisabled?: boolean;
  onClick: () => void;
  className?: string;
};

export function ArrowSwitch({
  label,
  isOn,
  isDisabled,
  onClick,
  className,
}: ArrowSwitchProps) {
  return (
    <button
      role="switch"
      className={className ? `arrow-switch ${className}` : 'arrow-switch'}
      aria-label={label}
      aria-checked={isOn}
      disabled={isDisabled}
      onClick={onClick}
    >
      <ArrowRightIcon width="14px" className={isOn ? 'lit-icon' : undefined} />
    </button>
  );
}
