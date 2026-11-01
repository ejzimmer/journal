import { ReactNode } from 'react';
import { useTooltipPopover } from '../../../shared/useTooltipPopover';

type CountTileProps = {
  name: string;
  label: string;
  addLabel: string;
  icon: ReactNode;
  count: number;
  onAdd: () => void;
};

export function CountTile({
  name,
  label,
  addLabel,
  icon,
  count,
  onAdd,
}: CountTileProps) {
  const { triggerProps, tooltipProps } = useTooltipPopover();

  return (
    <div className="progress-tile tooltip-container">
      <button
        type="button"
        className="count-button tooltip-anchor"
        {...triggerProps}
        aria-label={addLabel}
        onClick={onAdd}
      >
        {icon}
      </button>
      <div className="tooltip" {...tooltipProps} aria-hidden="true">
        {label}
      </div>
      <input
        key={count}
        type="number"
        name={name}
        aria-label={label}
        defaultValue={count}
        min={0}
      />
    </div>
  );
}
