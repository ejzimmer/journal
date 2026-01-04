import { useEffect, useId, useRef, useState } from "react"

type OptionType = {
  id: string
  label: string
}

type BaseProps<T> = {
  options: T[]
  createOption: (label: string) => T
  hideSelectedOptions?: boolean
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
  hideSelectedOptions,
}: ComboboxProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const popoverId = useId()
  const popoverStateRef = useRef<"open" | "closed">("closed")

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
        if (popoverStateRef.current !== "open") {
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
        if (popoverStateRef.current !== "open") {
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
        if (popoverStateRef.current !== "open")
          popoverRef.current?.showPopover()
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
