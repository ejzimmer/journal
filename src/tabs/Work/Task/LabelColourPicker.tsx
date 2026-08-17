import { useRef, useState } from "react"
import { COLOURS, Colour } from "../types"
import { ColourWheelIcon } from "../../../shared/icons/ColourWheel"
import { useClickOutside } from "../../../shared/controls/combobox/useClickOutside"

export function LabelColourPicker({
  label,
  colour,
  onChange,
}: {
  label: string
  colour: Colour
  onChange: (colour: Colour) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useClickOutside({
    elementRef: containerRef,
    onClickOutside: () => setIsOpen(false),
    shouldListen: isOpen,
  })

  return (
    <div className="label-colour-picker" ref={containerRef}>
      <button
        type="button"
        className="ghost transient"
        aria-label={`Change ${label} colour`}
        onClick={() => setIsOpen((open) => !open)}
      >
        <ColourWheelIcon width="16px" />
      </button>
      {isOpen && (
        <ul className="colour-swatches" aria-label={`Colours for ${label}`}>
          {COLOURS.map((option) => (
            <li key={option}>
              <button
                type="button"
                className={`colour-swatch ${option}`}
                aria-label={option}
                aria-pressed={option === colour}
                onClick={() => {
                  onChange(option)
                  setIsOpen(false)
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
