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
  return (
    <div className="single-value-container">
      <SearchInput
        isPopoverOpen={isPopoverOpen}
        value={searchInputValue}
        onChange={onChangeSearchTerm}
        {...searchInputProps}
      />
      {!isPopoverOpen && (
        <div className="value">{children ?? value?.label}</div>
      )}
    </div>
  )
}
