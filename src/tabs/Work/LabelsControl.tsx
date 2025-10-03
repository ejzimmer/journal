import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { Label, COLOURS } from "../../shared/TaskList/types"
import { XIcon } from "../../shared/icons/X"
import { LabelsContext } from "./LabelsContext"

export type LabelsControlProps = {
  value: Label[]
  onChange: (value: Label[]) => void
  label: string
}

export function LabelsControl({ value, onChange, label }: LabelsControlProps) {
  const labels = useContext(LabelsContext)
  const options = useMemo(() => labels ?? [], [labels])
  const popoutRef = useRef<HTMLDivElement | null>(null)
  const selectedValuesRef = useRef<HTMLUListElement | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [interactionMode, setInteractionMode] = useState<"search" | "scroll">(
    "search"
  )
  const [valuesWidth, setValuesWidth] = useState(0)

  const displayedOptions = useMemo(() => {
    const unselectedOptions = options.filter((o) => !value.includes(o))
    const searchTerm = inputValue.trimStart().toLowerCase()
    return searchTerm
      ? unselectedOptions.filter((o) =>
          o.value.toLowerCase().includes(searchTerm)
        )
      : unselectedOptions
  }, [options, value, inputValue])

  const unselectedOptions = useMemo(
    () => options.filter((o) => !value.includes(o)),
    [options, value]
  )

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
    const existingOption = options.find((o) => o.value === text)

    // Brand new option selected
    if (!existingOption) {
      const totalOptions = unselectedOptions.length + value.length
      onChange([
        ...value,
        {
          value: text,
          colour: COLOURS[totalOptions % COLOURS.length],
        },
      ])
    }

    // User typed an option that's already in the list, just re-use that one
    else if (!value.includes(existingOption)) {
      onChange([...value, existingOption])
    }

    setInputValue("")
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
        onChange([...value, displayedOptions[highlightedIndex]])
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

  const handleRemoveValue = (label: Label) => {
    onChange(value.filter((v) => v !== label))
  }

  const handleClearAll = () => {
    onChange([])
    setInputValue("")
  }

  useEffect(() => {
    if (!selectedValuesRef.current) return

    setValuesWidth(selectedValuesRef.current.getBoundingClientRect().width)
  }, [selectedValuesRef, value])

  return (
    <div className="labels">
      <input
        value={inputValue}
        onChange={(event) => handleInputChange(event.target.value)}
        onKeyDown={handleInputKeyDown}
        aria-label={label}
        style={{ paddingInlineStart: `${valuesWidth + 8}px` }}
      />
      <ul className="selectedLabels" ref={selectedValuesRef}>
        {value.map((label) => (
          <li key={label.value} className={`label ${label.colour}`}>
            {label.value}
            <button
              type="button"
              onClick={() => handleRemoveValue(label)}
              aria-label={`Remove ${label.value}`}
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
          onClick={handleClearAll}
          className="ghost"
        >
          <XIcon width="16px" />
        </button>
      )}
      <div ref={popoutRef} popover="auto" className="label-options">
        {displayedOptions.length ? (
          <ul className="options">
            {displayedOptions.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected="false"
                onClick={() => {
                  onChange([...value, option])
                  setInputValue("")
                }}
                className={index === highlightedIndex ? "highlighted" : ""}
              >
                {option.value}
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
