import { SearchInputProps, SearchInput } from "./SearchInput"
import { OptionType } from "./types"

type MultiValueInputProps<T> = {
  value: T[]
  onRemoveValue: (value: T) => void
  onRemoveAll: () => void
  searchInputValue: SearchInputProps["value"]
  onChangeSearchTerm: (event: React.ChangeEvent<HTMLInputElement>) => void
} & Omit<SearchInputProps, "value" | "onChange">

export function MultiValueInput<T extends OptionType>({
  value,
  onRemoveValue,
  onRemoveAll,
  searchInputValue,
  onChangeSearchTerm,
  ...searchInputProps
}: MultiValueInputProps<T>) {
  return (
    <div className="multi-value-container">
      <SearchInput
        value={searchInputValue}
        onChange={onChangeSearchTerm}
        {...searchInputProps}
      />
      <div>
        <ul>
          {value.map((v) => (
            <li key={v.id}>
              {v.label}{" "}
              <button onClick={() => onRemoveValue(v)}>Remove {v.label}</button>
            </li>
          ))}
        </ul>
        <button onClick={onRemoveAll}>Remove all</button>
      </div>
    </div>
  )
}
