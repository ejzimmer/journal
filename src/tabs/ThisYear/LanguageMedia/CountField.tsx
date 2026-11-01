import { ReactNode } from 'react';
import { useTooltipPopover } from '../../../shared/useTooltipPopover';

type CountFieldProps = {
  name: string;
  label: string;
  icon: ReactNode;
  defaultValue?: number;
  isRequired?: boolean;
};

export function CountField({
  name,
  label,
  icon,
  defaultValue,
  isRequired,
}: CountFieldProps) {
  const { triggerProps, tooltipProps } = useTooltipPopover();

  return (
    <div className="count-field tooltip-container">
      <span
        className="count-icon tooltip-anchor"
        {...triggerProps}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="tooltip" {...tooltipProps} aria-hidden="true">
        {label}
      </div>
      <input
        type="number"
        name={name}
        aria-label={label}
        min="0"
        defaultValue={defaultValue}
        required={isRequired}
      />
    </div>
  );
}
