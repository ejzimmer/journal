type VolumeNameFieldProps = {
  name: string;
  label: string;
  isRequired?: boolean;
  isFocused?: boolean;
};

export function VolumeNameField({
  name,
  label,
  isRequired,
  isFocused,
}: VolumeNameFieldProps) {
  return (
    <div className="volume-name-field tooltip-container">
      <span className="count-icon tooltip-anchor" aria-hidden="true">
        📕
      </span>
      <div className="tooltip" aria-hidden="true">
        {label}
      </div>
      <input
        name={name}
        aria-label={label}
        required={isRequired}
        autoFocus={isFocused}
      />
    </div>
  );
}
