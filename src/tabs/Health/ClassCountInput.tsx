type ClassCountInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
};

export function ClassCountInput({
  label,
  value,
  onChange,
  disabled,
}: ClassCountInputProps) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min="1"
      step="1"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      required
    />
  );
}
