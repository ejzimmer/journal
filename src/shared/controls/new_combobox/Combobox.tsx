import { useCallback, useEffect, useId, useRef, useState } from "react"
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
  Option,
  Value,
  label,
}: ComboboxProps<T>) {
  const inputId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const popoverId = useId()
  const popoverRef = useRef<HTMLDivElement>(null)
  const { popoverState, hidePopover, showPopover, togglePopover } =
    usePopoverState(popoverRef)

  const [searchTerm, setSearchTerm] = useState("")
  const displayedOptions = (
    searchTerm
      ? options.filter((o) =>
          o.label.toLowerCase().includes(searchTerm.trimStart().toLowerCase())
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

  const reset = useCallback(
    (alwayClosePopover?: boolean) => {
      if (!isMultiValue || alwayClosePopover) hidePopover()
      setSearchTerm("")
    },
    [hidePopover, isMultiValue]
  )

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
        event.preventDefault()
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
      case "Tab": {
        reset()
        break
      }
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

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        reset(true)
      }
    }
    window.addEventListener("click", handler)

    return () => {
      window.removeEventListener("click", handler)
    }
  }, [reset])

  return (
    <div>
      {label && (
        <label className="label" htmlFor={inputId}>
          {label}
        </label>
      )}

      <div ref={containerRef} className="combobox">
        <input
          id={inputId}
          role="combobox"
          aria-controls={popoverId}
          aria-expanded={popoverState === "open"}
          onKeyDown={handleKeyDown}
          value={searchTerm}
          onChange={(event) => {
            const value = event.target.value ?? ""
            setSearchTerm(value)

            if (!isMultiValue && value.trim()) {
              addOption(value)
            }
          }}
          onClick={togglePopover}
          autoComplete="off"
        />
        {isMultiValue ? (
          <div>
            <ul>
              {value.map((v) => (
                <li key={v.id}>
                  {v.label}{" "}
                  <button onClick={() => updateValue(v)}>
                    Remove {v.label}
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={() => onChange([])}>Remove all</button>
          </div>
        ) : (
          popoverState === "closed" && (
            <div className="single-value-container">
              {Value ? <Value value={value} /> : value?.label}
            </div>
          )
        )}
        <div
          ref={popoverRef}
          popover="manual"
          data-testid="popover"
          id={popoverId}
        >
          {displayedOptions.length ? (
            <ul className="options">
              {displayedOptions.map((option) => (
                <li
                  key={option.id}
                  role="option"
                  aria-selected={
                    isSelected({ value, option }) ? "true" : "false"
                  }
                  onClick={() => {
                    updateValue(option)
                    reset()
                  }}
                  className={option === highlightedOption ? "highlighted" : ""}
                >
                  {Option ? <Option value={option} /> : option.label}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: "20px 30px" }}>No options</div>
          )}
        </div>
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
