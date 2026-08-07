import { OptionType } from "./types"
import { isSelected } from "./utils"

type PopoverProps<T> = {
  popoverRef: React.RefObject<HTMLDivElement | null>
  popoverId: string
  options: T[]
  selected?: T | T[]
  onClick: (option: T) => void
  highlightedOption?: T
  Option?: React.FC<{
    value: T
  }>
}

export function Popover<T extends OptionType>({
  popoverRef,
  popoverId,
  options,
  selected,
  onClick,
  highlightedOption,
  Option,
}: PopoverProps<T>) {
  return (
    <div ref={popoverRef} popover="manual" data-testid="popover" id={popoverId}>
      {options.length ? (
        <ul
          className="options"
          onMouseDown={(event) => {
            // options aren't focusable, so without this the browser would
            // blur whatever's currently focused (e.g. the combobox input)
            // before the click below can select the option
            event.preventDefault()
          }}
        >
          {options.map((option) => (
            <li
              key={option.id}
              role="option"
              aria-selected={
                isSelected({ value: selected, option }) ? "true" : "false"
              }
              onClick={() => onClick(option)}
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
  )
}
