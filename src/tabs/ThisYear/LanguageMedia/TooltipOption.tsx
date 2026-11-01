import { ReactNode } from 'react';
import { Tooltip } from '../../../shared/controls/Tooltip';

type TooltipOptionProps = {
  icon: ReactNode;
  label: string;
};

export function TooltipOption({ icon, label }: TooltipOptionProps) {
  return (
    <Tooltip
      className="tooltip-option"
      text={label}
      role="img"
      aria-label={label}
    >
      {icon}
    </Tooltip>
  );
}
