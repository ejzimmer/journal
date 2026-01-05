import { useId, useRef, useState } from "react"
import { OptionType, ComboboxProps } from "./types"
import { usePopoverState } from "./usePopoverState"

import "./Combobox.css"

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
  const { popoverState, hidePopover, showPopover, togglePopover } =
    usePopoverState(popoverRef)

  const [searchTerm, setSearchTerm] = useState("")
  const displayedOptions = (
    searchTerm
      ? options.filter((o) =>
          o.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options
  ).filter((option) => !hideSelectedOptions || !isSelected({ value, option }))

  const selectedIndex =
    value && !isMultiValue
      ? displayedOptions.findIndex((o) => o.id === value.id)
      : -1
  const [highlightedOption, setHighlightedOption] = useState(
    selectedIndex > -1 ? displayedOptions[selectedIndex] : undefined
  )

  const reset = (alwayClosePopover?: boolean) => {
    if (!isMultiValue || alwayClosePopover) hidePopover()
    setSearchTerm("")
  }

  const updateValue = (option: T) => {
    if (isMultiValue) {
      const index = value.findIndex((v) => option.id === v.id)
      if (index > -1) {
        onChange(value.toSpliced(index, 1))
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
            showPopover()
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
            showPopover()
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
        showPopover()
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
    <div className="combobox">
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
        onClick={togglePopover}
      />
      {isMultiValue ? (
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
      ) : (
        popoverState === "closed" && (
          <div className="single-value-container">{value?.label}</div>
        )
      )}
      <div
        ref={popoverRef}
        popover="manual"
        data-testid="popover"
        id={popoverId}
      >
        <ul className="options">
          {displayedOptions.map((option) => (
            <li
              key={option.id}
              role="option"
              aria-selected={isSelected({ value, option }) ? "true" : "false"}
              onClick={() => {
                updateValue(option)
                reset()
              }}
              className={option === highlightedOption ? "highlighted" : ""}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const isSelected = <T extends OptionType>({
  value,
  option,
}: {
  value?: T | T[]
  option: T
}): boolean => {
  if (Array.isArray(value)) {
    return !!value.find((v) => v.id === option.id)
  } else {
    return value?.id === option.id
  }
}
