import { SearchInputProps } from "./types"

export function SearchInput({
  id,
  value,
  onChange,
  onKeyDown,
  onClick,
  popoverId,
  isPopoverOpen,
  size,
  ariaLabel,
}: SearchInputProps) {
  return (
    <input
      id={id}
      role="combobox"
      aria-controls={popoverId}
      aria-expanded={isPopoverOpen}
      onKeyDown={onKeyDown}
      value={value}
      onChange={onChange}
      onClick={onClick}
      autoComplete="off"
      size={size}
      aria-label={ariaLabel}
    />
  )
}
