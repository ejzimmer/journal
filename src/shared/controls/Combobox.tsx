import {
  useRef,
  useState,
  useMemo,
  type KeyboardEvent,
  type ChangeEvent,
} from "react"

export type Option = {
  id: string
  label: string
}

type ComboboxProps<T> = {
  options: T[]
  value: T[]
  onChange: (options: T[]) => void
  createOption: (label: string) => T
  onAddOption: (option: T) => void
  renderOption?: (option: T) => React.ReactNode
  renderButton?: (option: T) => React.ReactNode
}

export function Combobox<T extends Option>({
  options,
  value,
  onChange,
  createOption,
  onAddOption,
  renderOption,
  renderButton,
}: ComboboxProps<T>) {
  const popoverRef = useRef<HTMLDivElement>(null)

  const [highlightedOptionIndex, setHighlightedOptionIndex] = useState<number>()
  const [highlightedButtonIndex, setHighlightedButtonIndex] = useState<number>()
  const [lastKeyboardInteraction, setLastKeyboardInteraction] = useState<
    "button" | "option"
  >()

  const [filterValue, setFilterValue] = useState<string>("")

  const displayedOptions = useMemo(
    () =>
      filterValue.length > 0
        ? [
            ...options.filter((option) =>
              option.label.toLowerCase().includes(filterValue.toLowerCase())
            ),
            createOption(filterValue),
          ]
        : options,
    [filterValue, options, createOption]
  )

  const showPopover = () => {
    popoverRef.current?.showPopover()
  }

  const toggleSelected = (option: T) => {
    const isChecked = value.includes(option)

    if (isChecked) {
      deselectOption(option)
    } else {
      const newValue = [...value, option]
      onChange(newValue)
    }
  }

  const deselectOption = (option: T) => {
    const newValue = value.filter((o) => o !== option)
    onChange(newValue)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        setHighlightedOptionIndex((highlighted) =>
          typeof highlighted === "undefined"
            ? 0
            : (highlighted + 1) % displayedOptions.length
        )
        setLastKeyboardInteraction("option")
        break
      case "ArrowUp":
        setHighlightedOptionIndex((highlighted) =>
          typeof highlighted === "undefined"
            ? displayedOptions.length - 1
            : (highlighted + displayedOptions.length - 1) %
              displayedOptions.length
        )
        setLastKeyboardInteraction("option")
        break
      case "ArrowRight":
        setHighlightedButtonIndex((highlighted) =>
          typeof highlighted === "undefined"
            ? 0
            : (highlighted + 1) % value.length
        )
        setLastKeyboardInteraction("button")
        break
      case "ArrowLeft":
        setHighlightedButtonIndex((highlighted) =>
          typeof highlighted === "undefined"
            ? value.length - 1
            : (highlighted + value.length - 1) % value.length
        )
        setLastKeyboardInteraction("button")
        break
      case "Enter":
      case "Backspace":
        if (lastKeyboardInteraction === "button" && highlightedButtonIndex) {
          event.preventDefault()
          deselectOption(value[highlightedButtonIndex])
        }
        break
      case " ":
        if (typeof lastKeyboardInteraction === "undefined") {
          return
        }

        if (
          lastKeyboardInteraction === "option" &&
          highlightedOptionIndex !== undefined
        ) {
          const selectedOption = displayedOptions[highlightedOptionIndex]

          if (!options.includes(selectedOption)) {
            onAddOption(selectedOption)
            setFilterValue("")
          } else {
            toggleSelected(displayedOptions[highlightedOptionIndex])
          }
        }

        if (
          lastKeyboardInteraction === "button" &&
          highlightedButtonIndex !== undefined
        ) {
          deselectOption(value[highlightedButtonIndex])
        }

        break
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.trim()
    setFilterValue(newValue)
  }

  return (
    <>
      <input
        type="text"
        value={filterValue}
        onClick={showPopover}
        onFocus={showPopover}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
      />
      <div>
        {value.map((option) => (
          <button
            key={option.id}
            aria-label={`${option.label}, remove`}
            onClick={() => deselectOption(option)}
          >
            {renderButton?.(option) ?? option.label}
          </button>
        ))}
      </div>
      <div popover="auto" id="optionslist" ref={popoverRef} role="listbox">
        {displayedOptions.map((option) => (
          <div
            key={option.id}
            role="option"
            aria-selected={value.includes(option)}
            onClick={() => toggleSelected(option)}
          >
            {renderOption?.(option) ?? option.label}
          </div>
        ))}
      </div>
    </>
  )
}
