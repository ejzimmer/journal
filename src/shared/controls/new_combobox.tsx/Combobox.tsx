import { useEffect, useId, useRef, useState } from "react"

type OptionType = {
  id: string
  label: string
}

type ComboboxProps<T extends OptionType> = {
  value: T
  options: T[]
  onChange: (value: T) => void
}

export function Combobox<T extends OptionType>({
  value,
  options,
  onChange,
}: ComboboxProps<T>) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const popoverId = useId()
  const popoverStateRef = useRef<"open" | "closed">("closed")

  const selectedIndex = value ? options.findIndex((o) => o === value) : -1

  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex)

  useEffect(() => {
    if (!popoverRef.current) return

    const showPopover = popoverRef.current?.showPopover.bind(popoverRef.current)
    popoverRef.current.showPopover = function () {
      popoverStateRef.current = "open"
      showPopover()
    }
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case " ":
        popoverRef.current?.showPopover()
        break
      case "Enter":
        event.stopPropagation()
        onChange(options[highlightedIndex])
        break
      case "ArrowDown":
        if (popoverStateRef.current !== "open")
          onChange(options[(selectedIndex + 1) % options.length])
        setHighlightedIndex((highlightedIndex + 1) % options.length)
        break
      case "ArrowUp":
        if (popoverStateRef.current !== "open")
          onChange(
            options[
              (Math.max(selectedIndex, 0) - 1 + options.length) % options.length
            ]
          )
        setHighlightedIndex(
          (Math.max(highlightedIndex, 0) - 1 + options.length) % options.length
        )
    }
  }

  return (
    <>
      <input
        role="combobox"
        aria-controls={popoverId}
        aria-expanded={false} // fix this
        onKeyDown={handleKeyDown}
      />
      <div
        ref={popoverRef}
        popover="manual"
        data-testid="popover"
        id={popoverId}
      >
        <ul>
          {options.map((option, index) => (
            <li
              key={option.id}
              role="option"
              aria-selected={index === selectedIndex}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
