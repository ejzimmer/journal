import { ReactNode } from 'react';
import { Tooltip } from '../../../shared/controls/Tooltip';

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
  return (
    <div className="count-field">
      <Tooltip className="count-icon" text={label} aria-hidden="true">
        {icon}
      </Tooltip>
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
