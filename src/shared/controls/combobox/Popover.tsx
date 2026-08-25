import { useEffect, useRef } from "react"
import { OptionType } from "./types"
import { isSelected } from "./utils"
import { PopoverPlacement } from "./usePopoverPlacement"

type PopoverProps<T> = {
  popoverRef: React.RefObject<HTMLDivElement | null>
  popoverId: string
  anchorName: string
  placement: PopoverPlacement
  maxHeight?: number
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
  placement,
  maxHeight,
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
      className={placement === "above" ? "open-above" : ""}
      style={
        {
          positionAnchor: anchorName,
          maxHeight: maxHeight !== undefined ? `${maxHeight}px` : undefined,
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
