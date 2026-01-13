import { useEffect, useRef, useState } from "react"
import { XIcon } from "../../icons/X"
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
  const valuesRef = useRef<HTMLUListElement>(null)
  const [valuesWidth, setValuesWidth] = useState(0)

  useEffect(() => {
    if (!valuesRef.current) return

    setValuesWidth(valuesRef.current.getBoundingClientRect().width)
  }, [value])

  const containerStyles = {
    "--input-padding": valuesWidth + 4 + "px",
  } as React.CSSProperties

  return (
    <div className="multi-value-container" style={containerStyles}>
      <SearchInput
        value={searchInputValue}
        onChange={onChangeSearchTerm}
        {...searchInputProps}
      />
      <div>
        <ul ref={valuesRef} className="values">
          {value.map((v) => (
            <li key={v.id} className="value">
              {v.label}
              <button
                aria-label={`Remove ${v.label}`}
                onClick={() => onRemoveValue(v)}
                className="remove"
              >
                <XIcon width="14px" />
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={onRemoveAll}
          className="remove-all"
          aria-label="Remove all"
        >
          <XIcon width="16px" />
        </button>
      </div>
    </div>
  )
}
