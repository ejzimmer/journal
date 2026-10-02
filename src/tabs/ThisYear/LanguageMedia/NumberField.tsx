import { FieldProps } from './fields';

export function NumberField({
  label,
  name,
  defaultValue,
  isRequired,
  min = 1,
}: FieldProps<number> & { min?: number }) {
  return (
    <label>
      {label}
      <input
        name={name}
        type="number"
        min={min}
        defaultValue={defaultValue}
        required={isRequired}
      />
    </label>
  );
}
