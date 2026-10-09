import { ReactNode } from 'react';

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
  return (
    <div className="progress-tile tooltip-container">
      <button
        type="button"
        className="count-button tooltip-anchor"
        aria-label={addLabel}
        onClick={onAdd}
      >
        {icon}
      </button>
      <div className="tooltip" aria-hidden="true">
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
