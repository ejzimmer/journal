import { OptionType } from "./types"
import { isSelected } from "./utils"

type PopoverProps<T> = {
  popoverRef: React.RefObject<HTMLDivElement | null>
  popoverId: string
  anchorName: string
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
  anchorName,
  options,
  selected,
  onClick,
  highlightedOption,
  Option,
}: PopoverProps<T>) {
  return (
    <div
      ref={popoverRef}
      popover="manual"
      data-testid="popover"
      id={popoverId}
      style={{ positionAnchor: anchorName } as React.CSSProperties}
    >
      {options.length ? (
        <ul className="options">
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
