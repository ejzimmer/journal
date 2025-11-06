import { ReactNode, useEffect, useId, useMemo, useRef, useState } from "react"
import { XIcon } from "../icons/X"

import "./Combobox.css"

type OptionBase = { text: string }

type BaseProps<T> = {
  label: string
  options: T[]
  createOption: (text: string) => T
  Option?: React.FC<{ option: T; children?: React.ReactNode }>
}
type SingleSelectProps<T> = BaseProps<T> & {
  allowMulti?: false
  value: T | undefined
  onChange: (value: T) => void
}
type MultiSelectProps<T> = BaseProps<T> & {
  allowMulti: true
  value: T[]
  onChange: (value: T[]) => void
}

export type ComboboxProps<T extends OptionBase> =
  | SingleSelectProps<T>
  | MultiSelectProps<T>

export function Combobox<T extends OptionBase>({
  value,
  onChange,
  label,
  options,
  createOption,
  allowMulti,
  Option,
}: ComboboxProps<T>) {
  const popoutId = useId()
  const popoutRef = useRef<HTMLDivElement | null>(null)
  const selectedValuesRef = useRef<HTMLUListElement | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [interactionMode, setInteractionMode] = useState<"search" | "scroll">(
    "search"
  )
  const [valuesWidth, setValuesWidth] = useState(0)

  const unselectedOptions = useMemo(
    () =>
      Array.isArray(value)
        ? options.filter((o) => !listContainsOption(value, o))
        : options,
    [options, value]
  )
  const displayedOptions = useMemo(() => {
    const searchTerm = inputValue.trimStart().toLowerCase()
    return searchTerm
      ? unselectedOptions.filter((o) =>
          o.text.toLowerCase().includes(searchTerm)
        )
      : unselectedOptions
  }, [unselectedOptions, inputValue])

  const handleInputChange = (inputValue: string) => {
    setInputValue(inputValue)
    setHighlightedIndex(-1)
  }

  const handleEnter = (event: React.KeyboardEvent) => {
    if (!inputValue) return
    event.preventDefault()
    event.stopPropagation()

    const text = inputValue.trim()
    const existingOption = options.find((o) => o.text === text)
    const option = existingOption ?? createOption(text)

    handleChange(option)
    setInputValue("")
  }

  const handleChange = (option: T) => {
    // Don't add the option if it's already in the value
    if (allowMulti && !listContainsOption(value, option)) {
      onChange([...value, option])
    } else if (!allowMulti) {
      onChange(option)
    }
  }

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    const key = event.key

    switch (key) {
      case "Enter":
        handleEnter(event)
        setInteractionMode("search")
        break
      case " ":
        if (interactionMode === "search") {
          return
        }
        event.preventDefault()
        handleChange(displayedOptions[highlightedIndex])
        setInputValue("")
        break
      case "ArrowDown":
        event.preventDefault()
        setHighlightedIndex((highlightedIndex + 1) % displayedOptions.length)
        setInteractionMode("scroll")
        break
      case "ArrowUp":
        event.preventDefault()
        setHighlightedIndex(
          (highlightedIndex - 1 + displayedOptions.length) %
            displayedOptions.length
        )
        setInteractionMode("scroll")
        break
      default:
        setInteractionMode("search")
    }
  }

  const handleRemoveOption = (option: T) => {
    if (!allowMulti) return
    onChange(value.filter((v) => v !== option))
  }

  const handleClearAll = () => {
    if (!allowMulti) return
    onChange([])
    setInputValue("")
  }

  useEffect(() => {
    if (!selectedValuesRef.current || !allowMulti) return

    setValuesWidth(selectedValuesRef.current.getBoundingClientRect().width)
  }, [selectedValuesRef, value, allowMulti])

  return (
    <div className="combobox">
      <input
        value={inputValue}
        onChange={(event) => handleInputChange(event.target.value)}
        onKeyDown={handleInputKeyDown}
        aria-label={label}
        style={{ paddingInlineStart: `${valuesWidth + 8}px` }}
        role="combobox"
        aria-controls={popoutId}
        aria-expanded={true}
        onFocus={() => {
          popoutRef.current?.showPopover()
          if (!allowMulti) {
            const valueIndex = displayedOptions.findIndex(
              (o) => o.text === value?.text
            )
            setHighlightedIndex(valueIndex)
          }
        }}
        onBlur={() => popoutRef.current?.hidePopover()}
      />
      {allowMulti ? (
        <MultiValue
          value={value}
          onRemove={handleRemoveOption}
          onClearAll={handleClearAll}
          ref={selectedValuesRef}
          Option={Option}
        />
      ) : (
        <SingleValue value={value} Option={Option} />
      )}
      <div ref={popoutRef} popover="manual" className="options" id={popoutId}>
        <ul className="options">
          {displayedOptions.length ? (
            displayedOptions.map((option, index) => (
              <li
                key={option.text}
                role="option"
                aria-selected="false"
                onClick={() => {
                  handleChange(option)
                  setInputValue("")
                }}
                className={index === highlightedIndex ? "highlighted" : ""}
              >
                {Option ? <Option option={option} /> : option.text}
              </li>
            ))
          ) : (
            <li className="no-options" style={{ padding: "8px" }}>
              No options found
            </li>
          )}
        </ul>
      </div>
    </div>
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

function DefaultOption<T extends { text: string }>({
  option,
  children,
}: {
  option: T
  children?: ReactNode
}) {
  return (
    <>
      {option.text} {children}
    </>
  )
}

const listContainsOption = (list: OptionBase[], option: OptionBase) =>
  list.find((v) => v.text === option.text)
