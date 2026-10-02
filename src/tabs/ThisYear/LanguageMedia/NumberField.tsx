import { FieldProps } from './fields';

export function NumberField({
  label,
  name,
  defaultValue,
  isRequired,
  min = 1,
  max,
}: FieldProps<number> & { min?: number; max?: number }) {
  return (
    <label>
      {label}
      <input
        name={name}
        type="number"
        min={min}
        max={max}
        defaultValue={defaultValue}
        required={isRequired}
      />
    </label>
  );
}
