import { useEffect, useRef } from "react"
import { OptionType } from "./types"
import { isSelected } from "./utils"
import { PopoverPlacement } from "./usePopoverPlacement"

type PopoverProps<T> = {
  popoverRef: React.RefObject<HTMLDivElement | null>
  popoverId: string
  placement: PopoverPlacement
  maxHeight: number
  top?: number
  bottom?: number
  left: number
  minWidth: number
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
  placement,
  maxHeight,
  top,
  bottom,
  left,
  minWidth,
  options,
  selected,
  onClick,
  highlightedOption,
  Option,
}: PopoverProps<T>) {
  const highlightedRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    highlightedRef.current?.scrollIntoView({ block: "nearest" })
  }, [highlightedOption])

  return (
    <div
      ref={popoverRef}
      popover="manual"
      data-testid="popover"
      id={popoverId}
      data-placement={placement}
      style={
        {
          // The popover UA stylesheet defaults inset to 0, so the side we're
          // not positioning from must be set to "auto" explicitly -
          // otherwise that leftover 0 wins over the side we do set, once
          // height ends up over-constrained between the two.
          top: top !== undefined ? `${top}px` : "auto",
          bottom: bottom !== undefined ? `${bottom}px` : "auto",
          left: `${left}px`,
          minWidth: `${minWidth}px`,
          maxHeight: `${maxHeight}px`,
        } as React.CSSProperties
      }
    >
      {options.length ? (
        <ul className="options">
          {options.map((option) => {
            const isHighlighted = option === highlightedOption
            return (
              <li
                key={option.id}
                ref={isHighlighted ? highlightedRef : undefined}
                role="option"
                aria-selected={
                  isSelected({ value: selected, option }) ? "true" : "false"
                }
                onClick={() => onClick(option)}
                className={isHighlighted ? "highlighted" : ""}
              >
                {Option ? <Option value={option} /> : option.label}
              </li>
            )
          })}
        </ul>
      ) : (
        <div style={{ padding: "20px 30px" }}>No options</div>
      )}
    </div>
  )
}
