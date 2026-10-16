import { ReactNode } from 'react';

type CountFieldProps = {
  name: string;
  label: string;
  icon: ReactNode;
};

export function CountField({ name, label, icon }: CountFieldProps) {
  return (
    <div className="count-field tooltip-container">
      <span className="count-icon tooltip-anchor" aria-hidden="true">
        {icon}
      </span>
      <div className="tooltip" aria-hidden="true">
        {label}
      </div>
      <input type="number" name={name} aria-label={label} min="0" />
    </div>
  );
}
