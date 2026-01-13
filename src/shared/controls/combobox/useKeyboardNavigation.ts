import { useState } from "react"
import { OptionType } from "./types"

export function useKeyboardNavigation<T extends OptionType>({
  value,
  options,
  onChange,
}: {
  value?: T
  options: T[]
  onChange: (value: T) => void
}) {
  const selectedIndex = value ? options.findIndex((o) => o.id === value.id) : -1

  const [highlightedOption, setHighlightedOption] = useState(
    selectedIndex > -1 ? options[selectedIndex] : undefined
  )
  if (highlightedOption && !options.includes(highlightedOption)) {
    setHighlightedOption(undefined)
  }

  const onArrowKeyDown = (direction: "up" | "down") => {
    const highlightedIndex = options.findIndex((o) => o === highlightedOption)

    if (direction === "up") {
      const newSelectedIndex = Math.max(selectedIndex, 0) - 1 + options.length
      const newHighlightedIndex =
        Math.max(highlightedIndex, 0) - 1 + options.length
      onUpdateHighlightedOption(newSelectedIndex, newHighlightedIndex)
    } else {
      onUpdateHighlightedOption(selectedIndex + 1, highlightedIndex + 1)
    }
  }

  const onUpdateHighlightedOption = (
    newSelectedIndex: number,
    newHighlightedIndex: number
  ) => {
    onChange(options[newSelectedIndex % options.length])
    setHighlightedOption(options[newHighlightedIndex % options.length])
  }

  return { highlightedOption, onArrowKeyDown }
}
