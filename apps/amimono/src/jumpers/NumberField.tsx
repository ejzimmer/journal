import { useId } from 'react';

type NumberFieldProps = {
  label: string;
  unit?: string;
  value: string;
  onChange: (value: string) => void;
  allowNegative?: boolean;
  hint?: string;
};

export function NumberField({
  label,
  unit,
  value,
  onChange,
  allowNegative,
  hint,
}: NumberFieldProps) {
  const id = useId();

  return (
    <div className="number-field">
      <label htmlFor={id}>{label}</label>
      <span className="number-input">
        <input
          id={id}
          type="number"
          min={allowNegative ? undefined : '0'}
          step="any"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        {unit && <span aria-hidden="true">{unit}</span>}
      </span>
      {hint && (
        <small id={`${id}-hint`} className="hint">
          {hint}
        </small>
      )}
    </div>
  );
}
