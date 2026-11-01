import { Ref } from 'react';
import { useTooltipPopover } from '../../shared/useTooltipPopover';

type SessionProps = {
  name: string;
  label: string;
  isChecked: boolean;
  onToggle: () => void;
  inputRef?: Ref<HTMLInputElement>;
};

export function Session({
  name,
  label,
  isChecked,
  onToggle,
  inputRef,
}: SessionProps) {
  const { triggerProps, tooltipProps } = useTooltipPopover();

  return (
    <div className="tooltip-container" {...triggerProps}>
      <div className="tooltip-anchor">
        <input
          ref={inputRef}
          type="checkbox"
          className="session"
          aria-label={label}
          checked={isChecked}
          onChange={onToggle}
        />
      </div>
      <div className="tooltip" {...tooltipProps}>
        {name}
      </div>
    </div>
  );
}
