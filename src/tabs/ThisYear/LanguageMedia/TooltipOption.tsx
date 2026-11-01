import { ReactNode } from 'react';
import { useTooltipPopover } from '../../../shared/useTooltipPopover';

type TooltipOptionProps = {
  icon: ReactNode;
  label: string;
};

export function TooltipOption({ icon, label }: TooltipOptionProps) {
  const { triggerProps, tooltipProps } = useTooltipPopover<HTMLSpanElement>();

  return (
    <span className="tooltip-option tooltip-container" {...triggerProps}>
      <span className="tooltip-anchor" role="img" aria-label={label}>
        {icon}
      </span>
      <span className="tooltip" {...tooltipProps} aria-hidden="true">
        {label}
      </span>
    </span>
  );
}
