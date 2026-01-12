import { ReactNode } from "react"
import { SearchInputProps, SearchInput } from "./SearchInput"
import { OptionType } from "./types"

type SingleValueInputProps<T> = {
  value?: T
  searchInputValue: string
  onChangeSearchTerm: (event: React.ChangeEvent<HTMLInputElement>) => void
  children: ReactNode
} & Omit<SearchInputProps, "value" | "onChange">

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
