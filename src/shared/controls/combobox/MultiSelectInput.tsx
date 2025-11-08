import { useRef, useState, useEffect, ReactNode } from "react"
import { XIcon } from "../../icons/X"
import { DefaultOption } from "./DefaultOption"

export type MultiSelectInputProps<T> = {
  label: string
  value: T[]
  onChange: (value: T[]) => void
  inputValue: string
  onChangeInputValue: (text: string) => void
  onKeyDown: (event: React.KeyboardEvent) => void
  onFocus: () => void
  popoutId: string
  isPopoutOpen: boolean
  Option?: React.FC<{ option: T; children?: React.ReactNode }>
}

export function MultiSelectInput<T extends { text: string }>({
  label,
  value,
  onChange,
  inputValue,
  onChangeInputValue,
  onKeyDown,
  onFocus,
  popoutId,
  isPopoutOpen,
  Option,
}: MultiSelectInputProps<T>) {
  const selectedValuesRef = useRef<HTMLUListElement | null>(null)
  const [valuesWidth, setValuesWidth] = useState(0)

  useEffect(() => {
    if (!selectedValuesRef.current) return

    setValuesWidth(selectedValuesRef.current.getBoundingClientRect().width)
    onChangeInputValue("")
  }, [selectedValuesRef, onChangeInputValue, value])

  const handleClearAll = () => {
    onChange([])
    onChangeInputValue("")
  }

  return (
    <>
      <input
        value={inputValue}
        onChange={(event) => onChangeInputValue(event.target.value)}
        onKeyDown={onKeyDown}
        aria-label={label}
        style={{ paddingInlineStart: `${valuesWidth + 8}px` }}
        role="combobox"
        aria-controls={popoutId}
        aria-expanded={isPopoutOpen}
        onFocus={onFocus}
      />
      <MultiValue
        value={value}
        onRemove={(option) => onChange(value.filter((v) => v !== option))}
        onClearAll={handleClearAll}
        ref={selectedValuesRef}
        Option={Option}
      />
    </>
  )
}

type MultiValueProps<T> = {
  value: T[]
  onRemove: (option: T) => void
  onClearAll: () => void
  ref: React.Ref<HTMLUListElement>
  Option?: React.FC<{ option: T; children?: ReactNode }>
}
function MultiValue<T extends { text: string }>({
  value,
  onRemove,
  onClearAll,
  ref,
  Option = DefaultOption,
}: MultiValueProps<T>) {
  return (
    <>
      <ul className="selectedOptions" ref={ref}>
        {value.map((option) => (
          <li key={option.text}>
            <Option option={option}>
              <button
                type="button"
                onClick={() => onRemove(option)}
                aria-label={`Remove ${option.text}`}
                className="ghost round"
              >
                <XIcon width="12px" />
              </button>
            </Option>
          </li>
        ))}
      </ul>
      {value.length > 0 && (
        <button
          aria-label="Clear all"
          type="button"
          onClick={onClearAll}
          className="ghost"
        >
          <XIcon width="16px" />
        </button>
      )}
    </>
  )
}
