import { FieldProps } from './fields';

export function TextField({
  label,
  name,
  defaultValue,
  isRequired,
  type = 'text',
}: FieldProps<string> & { type?: 'text' | 'url' }) {
  return (
    <label>
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={isRequired}
      />
    </label>
  );
}
