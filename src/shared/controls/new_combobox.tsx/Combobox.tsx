import { useEffect, useId, useRef, useState } from "react"

type OptionType = {
  id: string
  label: string
}

type BaseProps<T> = {
  options: T[]
  createOption: (label: string) => T
}
type SingleValueProps<T> = BaseProps<T> & {
  isMultiValue?: false
  value: T | undefined
  onChange: (value: T) => void
}
type MultiValueProps<T> = BaseProps<T> & {
  isMultiValue: true
  value: T[]
  onChange: (value: T[]) => void
}

export type ComboboxProps<T extends OptionType> =
  | SingleValueProps<T>
  | MultiValueProps<T>

export function Combobox<T extends OptionType>({
  isMultiValue,
  value,
  options,
  onChange,
  createOption,
}: ComboboxProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const popoverId = useId()
  const popoverStateRef = useRef<"open" | "closed">("closed")

  const [searchTerm, setSearchTerm] = useState("")
  const displayedOptions = searchTerm
    ? options.filter((o) =>
        o.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  const selectedIndex = value
    ? displayedOptions.findIndex((o) => o === value)
    : -1
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex)

  const reset = (alwayClosePopover?: boolean) => {
    if (!isMultiValue || alwayClosePopover) popoverRef.current?.hidePopover()
    setSearchTerm("")
  }

  useEffect(() => {
    if (!popoverRef.current) return

    const showPopover = popoverRef.current?.showPopover.bind(popoverRef.current)
    popoverRef.current.showPopover = function () {
      popoverStateRef.current = "open"
      showPopover()
    }

    const hidePopover = popoverRef.current?.hidePopover.bind(popoverRef.current)
    popoverRef.current.hidePopover = function () {
      popoverStateRef.current = "open"
      hidePopover()
    }
  }, [])

  const updateValue = (newValue: T) => {
    if (isMultiValue) {
      onChange([...value, newValue])
    } else {
      onChange(newValue)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
        event.stopPropagation()
        if (highlightedIndex > -1) {
          updateValue(displayedOptions[highlightedIndex])
        } else if (isMultiValue && searchTerm) {
          addOption(searchTerm)
        }
        reset()
        break
      case "ArrowDown":
        if (popoverStateRef.current !== "open")
          updateValue(
            displayedOptions[(selectedIndex + 1) % displayedOptions.length]
          )
        setHighlightedIndex((highlightedIndex + 1) % displayedOptions.length)
        break
      case "ArrowUp":
        if (popoverStateRef.current !== "open")
          updateValue(
            displayedOptions[
              (Math.max(selectedIndex, 0) - 1 + displayedOptions.length) %
                displayedOptions.length
            ]
          )
        setHighlightedIndex(
          (Math.max(highlightedIndex, 0) - 1 + displayedOptions.length) %
            displayedOptions.length
        )
        break
      default:
        if (popoverStateRef.current !== "open")
          popoverRef.current?.showPopover()
    }
  }

  const addOption = (label: string) => {
    const existingOption = options.find((o) => o.label === label)
    updateValue(existingOption ?? createOption(label))
  }

  return (
    <>
      <input
        ref={inputRef}
        role="combobox"
        aria-controls={popoverId}
        aria-expanded={popoverStateRef.current === "open"}
        onKeyDown={handleKeyDown}
        value={searchTerm}
        onChange={(event) => {
          const value = event.target.value.trim()
          if (value) {
            setSearchTerm(value)

            if (!isMultiValue) {
              addOption(value)
            }
          }
        }}
        onBlur={() => reset(true)}
      />
      <div
        ref={popoverRef}
        popover="manual"
        data-testid="popover"
        id={popoverId}
      >
        <ul>
          {displayedOptions.map((option, index) => (
            <li
              key={option.id}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => {
                updateValue(option)
                reset()
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
