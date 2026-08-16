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
  const isShowingValue = !isPopoverOpen && !!(children || value)

  return (
    <div
      className={`single-value-container${isShowingValue ? " showing-value" : ""}`}
    >
      <SearchInput
        isPopoverOpen={isPopoverOpen}
        value={searchInputValue}
        onChange={onChangeSearchTerm}
        {...searchInputProps}
      />
      {isShowingValue && (
        <div className="value">{children ?? value?.label}</div>
      )}
    </div>
  )
}
