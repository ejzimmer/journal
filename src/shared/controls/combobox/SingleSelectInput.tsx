import { ReactNode } from "react"
import { DefaultOption } from "./DefaultOption"

export type SingleSelectValueProps<T> = {
  label: string
  value: T | undefined
  inputValue: string
  onChangeInputValue: (text: string) => void
  onKeyDown: (event: React.KeyboardEvent) => void
  popoutId: string
  isPopoutOpen: boolean
  onFocus: () => void
  Option?: React.FC<{ option: T; children?: React.ReactNode }>
}

export function SingleSelectValue<T extends { text: string }>({
  label,
  value,
  inputValue,
  onChangeInputValue,
  onKeyDown,
  popoutId,
  isPopoutOpen,
  onFocus,
  Option,
}: SingleSelectValueProps<T>) {
  return (
    <>
      <input
        value={inputValue}
        onChange={(event) => onChangeInputValue(event.target.value)}
        onKeyDown={onKeyDown}
        aria-label={label}
        role="combobox"
        aria-controls={popoutId}
        aria-expanded={isPopoutOpen}
        onFocus={onFocus}
        onClick={onFocus}
      />
      {!isPopoutOpen && <SingleValue value={value} Option={Option} />}
    </>
  )
}

function SingleValue<T extends { text: string }>({
  value,
  Option = DefaultOption,
}: {
  value?: T
  Option?: React.FC<{ option: T; children?: ReactNode }>
}) {
  return value ? (
    <div className="single-value-container">
      <Option option={value} />
    </div>
  ) : null
}
