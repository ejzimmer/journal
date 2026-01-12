export type SearchInputProps = {
  id: string
  value: string
  popoverId: string
  isPopoverOpen: boolean
  onKeyDown: (event: React.KeyboardEvent) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClick: (event: React.MouseEvent) => void
}

export function SearchInput({
  id,
  value,
  onChange,
  onKeyDown,
  onClick,
  popoverId,
  isPopoverOpen,
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
    />
  )
}
