import { ReactNode } from 'react';

type TooltipOptionProps = {
  icon: ReactNode;
  label: string;
};

export function TooltipOption({ icon, label }: TooltipOptionProps) {
  return (
    <span className="tooltip-option tooltip-container">
      <span className="tooltip-anchor">{icon}</span>
      <span className="tooltip">{label}</span>
    </span>
  );
}
