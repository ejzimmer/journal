import { useId, useRef, useState } from "react"
import { OptionType, ComboboxProps } from "./types"
import { usePopoverState } from "./usePopoverState"

export function Combobox<T extends OptionType>({
  isMultiValue,
  value,
  options,
  onChange,
  createOption,
  hideSelectedOptions,
}: ComboboxProps<T>) {
  const popoverId = useId()
  const popoverRef = useRef<HTMLDivElement>(null)
  const popoverState = usePopoverState(popoverRef)

  const [searchTerm, setSearchTerm] = useState("")
  const displayedOptions = (
    searchTerm
      ? options.filter((o) =>
          o.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options
  ).filter(
    (option) =>
      !hideSelectedOptions ||
      (isMultiValue ? !value.includes(option) : value !== option)
  )

  const selectedIndex = value
    ? displayedOptions.findIndex((o) => o === value)
    : -1
  const [highlightedOption, setHighlightedOption] = useState(
    selectedIndex > -1 ? displayedOptions[selectedIndex] : undefined
  )

  const reset = (alwayClosePopover?: boolean) => {
    if (!isMultiValue || alwayClosePopover) popoverRef.current?.hidePopover()
    setSearchTerm("")
  }

  const updateValue = (option: T) => {
    if (isMultiValue) {
      if (value.includes(option)) {
        onChange(value.filter((o) => o !== option))
      } else {
        onChange([...value, option])
      }
    } else {
      onChange(option)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const highlightedIndex = displayedOptions.findIndex(
      (o) => o === highlightedOption
    )
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
        if (popoverState !== "open") {
          if (isMultiValue) {
            popoverRef.current?.showPopover()
          } else {
            updateValue(
              displayedOptions[(selectedIndex + 1) % displayedOptions.length]
            )
          }
        }
        setHighlightedOption(
          displayedOptions[(highlightedIndex + 1) % displayedOptions.length]
        )
        break
      case "ArrowUp":
        if (popoverState !== "open") {
          if (isMultiValue) {
            popoverRef.current?.showPopover()
          } else {
            updateValue(
              displayedOptions[
                (Math.max(selectedIndex, 0) - 1 + displayedOptions.length) %
                  displayedOptions.length
              ]
            )
          }
        }
        setHighlightedOption(
          displayedOptions[
            (Math.max(highlightedIndex, 0) - 1 + displayedOptions.length) %
              displayedOptions.length
          ]
        )
        break
      default:
        if (popoverState !== "open") popoverRef.current?.showPopover()
    }
  }

  const addOption = (label: string) => {
    const existingOption = options.find((o) => o.label === label)
    if (existingOption && isMultiValue && value.includes(existingOption)) {
      return
    }
    updateValue(existingOption ?? createOption(label))
  }

  return (
    <>
      <input
        role="combobox"
        aria-controls={popoverId}
        aria-expanded={popoverState === "open"}
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
      {isMultiValue && (
        <div>
          <ul>
            {value.map((v) => (
              <li key={v.id}>
                {v.label}{" "}
                <button onClick={() => updateValue(v)}>Remove {v.label}</button>
              </li>
            ))}
          </ul>
          <button onClick={() => onChange([])}>Remove all</button>
        </div>
      )}
      <div
        ref={popoverRef}
        popover="manual"
        data-testid="popover"
        id={popoverId}
      >
        <ul>
          {displayedOptions.map((option) => (
            <li
              key={option.id}
              role="option"
              aria-selected={
                isMultiValue ? value.includes(option) : option === value
              }
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
