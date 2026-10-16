import { ReactNode } from 'react';

export function TooltipOption({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span className="tooltip-option tooltip-container">
      <span className="tooltip-anchor">{icon}</span>
      <span className="tooltip">{label}</span>
    </span>
  );
}
