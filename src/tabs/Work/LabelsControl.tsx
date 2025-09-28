import { useMemo, useState } from "react"
import { Label, COLOURS } from "../../shared/TaskList/types"

export type LabelsControlProps = {
  value: Label[]
  onChange: (value: Label[]) => void
  options: Label[]
  label: string
}

export function LabelsControl({
  value,
  onChange,
  options,
  label,
}: LabelsControlProps) {
  const [inputValue, setInputValue] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [filteredOptions, setFilteredOptions] = useState(options)
  const [interactionMode, setInteractionMode] = useState<"search" | "scroll">(
    "search"
  )

  const handleInputChange = (inputValue: string) => {
    if (inputValue) {
      const searchTerm = inputValue.toLowerCase().trim()
      setFilteredOptions(
        options.filter(({ value }) => value.toLowerCase().includes(searchTerm))
      )
    } else {
      setFilteredOptions(options)
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
      onChange([
        ...value,
        {
          value: text,
          colour: COLOURS[options.length % COLOURS.length],
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
        setHighlightedIndex((highlightedIndex + 1) % displayedOptions.length)
        setInteractionMode("scroll")
        break
      case "ArrowUp":
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

  const displayedOptions = useMemo(
    () => filteredOptions.filter((o) => !value.includes(o)),
    [filteredOptions, value]
  )

  return (
    <>
      <input
        value={inputValue}
        onChange={(event) => handleInputChange(event.target.value)}
        onKeyDown={handleInputKeyDown}
        aria-label={label}
      />
      {value.map((label) => (
        <div key={label.value} className={label.colour}>
          {label.value}
          <button onClick={() => handleRemoveValue(label)}>
            Remove {label.value}
          </button>
        </div>
      ))}
      <button onClick={handleClearAll}>Clear all</button>
      {displayedOptions.map((option) => (
        <div
          key={option.value}
          role="option"
          aria-selected="false"
          onClick={() => {
            onChange([...value, option])
            setInputValue("")
          }}
        >
          {option.value}
        </div>
      ))}
    </>
  )
}
