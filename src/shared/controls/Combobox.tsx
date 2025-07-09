import { useRef, useState, type KeyboardEvent } from "react"

type Option = {
  id: string
  label: string
}

type ComboboxProps<T> = {
  options: T[]
}

export function Combobox<T extends Option>({ options }: ComboboxProps<T>) {
  const popoverRef = useRef<HTMLDivElement>(null)

  const [selectedOptions, setSelectedOptions] = useState<T[]>([])
  const [highlightedOption, setHighlightedOption] = useState<number>()

  const showPopover = () => {
    popoverRef.current?.showPopover()
  }

  const toggleCheckbox = (option: T) => {
    const isChecked = selectedOptions.includes(option)

    if (isChecked) {
      deselectOption(option)
    } else {
      setSelectedOptions((value) => [...value, option])
    }
  }

  const deselectOption = (option: T) => {
    setSelectedOptions((options) => options.filter((o) => o !== option))
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        setHighlightedOption((highlighted) =>
          typeof highlighted === "undefined"
            ? 0
            : (highlighted + 1) % options.length
        )
        break
      case "ArrowUp":
        setHighlightedOption((highlighted) =>
          typeof highlighted === "undefined"
            ? options.length - 1
            : (highlighted + options.length - 1) % options.length
        )
        break
      case " ":
        if (typeof highlightedOption !== "undefined") {
          toggleCheckbox(options[highlightedOption])
        }
    }
  }

  return (
    <>
      <input
        type="text"
        onClick={showPopover}
        onFocus={showPopover}
        onKeyDown={handleKeyDown}
      />
      <div>
        {selectedOptions.map((option) => (
          <button
            key={option.id}
            aria-label={`${option.label}, remove`}
            onClick={() => deselectOption(option)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div popover="auto" id="optionslist" ref={popoverRef} role="listbox">
        {options.map((option) => (
          <div
            key={option.id}
            role="option"
            aria-selected={selectedOptions.includes(option)}
            onClick={() => toggleCheckbox(option)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </>
  )
}
