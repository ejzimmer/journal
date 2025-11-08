import { ReactNode, useEffect, useRef, useState } from "react"
import { OptionBase } from "./types"

export type DropdownProps<T> = {
  id: string
  isPopoutOpen: boolean
  options: T[]
  selectedOption?: T
  children?: ReactNode
  onClick: (option: T) => void
  Option?: React.FC<{ option: T; children?: React.ReactNode }>
  //90
}

export function Dropdown<T extends OptionBase>({
  id,
  isPopoutOpen,
  options,
  selectedOption,
  children,
  onClick,
  Option,
}: DropdownProps<T>) {
  const popoutRef = useRef<HTMLDivElement | null>(null)
  const popoutState = useRef<"open" | "closed">("closed")
  const [highlightedOption, setHighlightedOption] = useState(selectedOption)

  if (popoutState.current === "closed" && isPopoutOpen) {
    popoutRef.current?.showPopover()
    popoutState.current = "open"
    if (!selectedOption) {
      setHighlightedOption(undefined)
    }
  } else if (popoutState.current === "open" && !isPopoutOpen) {
    popoutRef.current?.hidePopover()
    popoutState.current = "closed"
  }

  useEffect(() => {
    if (!isPopoutOpen) {
      return
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key

      if (key === " " && highlightedOption) {
        onClick(highlightedOption)
        return
      }

      const currentIndex = options.findIndex((o) => o === highlightedOption)
      switch (key) {
        case "ArrowDown":
          setHighlightedOption(options[(currentIndex + 1) % options.length])
          break
        case "ArrowUp":
          const newIndex =
            (Math.max(currentIndex, 0) - 1 + options.length) % options.length
          setHighlightedOption(options[newIndex])
          break
      }
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClick, options, isPopoutOpen, highlightedOption])

  return (
    <div className="combobox">
      {children}
      <div ref={popoutRef} popover="manual" className="options" id={id}>
        <ul className="options">
          {options.length ? (
            options.map((option) => (
              <li
                key={option.text}
                role="option"
                aria-selected={highlightedOption === option}
                onClick={() => onClick(option)}
                className={option === highlightedOption ? "highlighted" : ""}
              >
                {Option ? <Option option={option} /> : option.text}
              </li>
            ))
          ) : (
            <li className="no-options" style={{ padding: "8px" }}>
              No options found
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
