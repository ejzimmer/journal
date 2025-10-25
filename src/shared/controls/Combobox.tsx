import { useEffect, useMemo, useRef, useState } from "react"
import { XIcon } from "../icons/X"

import "./Combobox.css"

type BaseProps<T> = {
  label: string
  options: T[]
  createOption: (text: string) => T
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

export type ComboboxProps<T extends { text: string }> =
  | SingleSelectProps<T>
  | MultiSelectProps<T>

export function Combobox<T extends { text: string }>({
  value,
  onChange,
  label,
  options,
  createOption,
  allowMulti,
}: ComboboxProps<T>) {
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
        ? options.filter((o) => !value.includes(o))
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
    if (inputValue) {
      popoutRef.current?.showPopover()
    } else {
      popoutRef.current?.hidePopover()
    }

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
    if (allowMulti && !value.includes(option)) {
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
      />
      {allowMulti ? (
        <MultiValue
          value={value}
          onRemove={handleRemoveOption}
          onClearAll={handleClearAll}
          ref={selectedValuesRef}
        />
      ) : (
        <SingleValue value={value} />
      )}
      <div ref={popoutRef} popover="auto" className="options">
        {displayedOptions.length ? (
          <ul className="options">
            {displayedOptions.map((option, index) => (
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
                {option.text}
              </li>
            ))}
          </ul>
        ) : (
          <li className="no-options">No options found</li>
        )}
      </div>
    </div>
  )
}

type MultiValueProps<T> = {
  value: T[]
  onRemove: (option: T) => void
  onClearAll: () => void
  ref: React.Ref<HTMLUListElement>
}
function MultiValue<T extends { text: string }>({
  value,
  onRemove,
  onClearAll,
  ref,
}: MultiValueProps<T>) {
  return (
    <>
      <ul className="selectedOptions" ref={ref}>
        {value.map((option) => (
          <li key={option.text}>
            {option.text}
            <button
              type="button"
              onClick={() => onRemove(option)}
              aria-label={`Remove ${option.text}`}
              className="ghost round"
            >
              <XIcon width="12px" />
            </button>
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

function SingleValue<T extends { text: string }>({ value }: { value?: T }) {
  return value ? <div>{value.text}</div> : null
}
