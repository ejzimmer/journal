import { useTooltipPopover } from '../../../shared/useTooltipPopover';

type VolumeNameFieldProps = {
  name: string;
  label: string;
  defaultValue?: string;
  isRequired?: boolean;
  isFocused?: boolean;
};

export function VolumeNameField({
  name,
  label,
  defaultValue,
  isRequired,
  isFocused,
}: VolumeNameFieldProps) {
  const { triggerProps, tooltipProps } = useTooltipPopover();

  return (
    <div className="volume-name-field tooltip-container">
      <span
        className="count-icon tooltip-anchor"
        {...triggerProps}
        aria-hidden="true"
      >
        📕
      </span>
      <div className="tooltip" {...tooltipProps} aria-hidden="true">
        {label}
      </div>
      <input
        name={name}
        aria-label={label}
        defaultValue={defaultValue}
        required={isRequired}
        autoFocus={isFocused}
      />
    </div>
  );
}
