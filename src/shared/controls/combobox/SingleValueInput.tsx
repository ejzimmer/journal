import { SearchInput } from "./SearchInput"
import { OptionType, SingleValueInputProps } from "./types"

export function SingleValueInput<T extends OptionType>({
  value,
  searchInputValue,
  onChangeSearchTerm,
  isPopoverOpen,
  children,
  ...searchInputProps
}: SingleValueInputProps<T>) {
  const showsValue = !isPopoverOpen && !!(children || value)

  return (
    <div
      className={`single-value-container${showsValue ? " showing-value" : ""}`}
    >
      <SearchInput
        isPopoverOpen={isPopoverOpen}
        value={searchInputValue}
        onChange={onChangeSearchTerm}
        {...searchInputProps}
      />
      {showsValue && <div className="value">{children ?? value?.label}</div>}
    </div>
  )
}
