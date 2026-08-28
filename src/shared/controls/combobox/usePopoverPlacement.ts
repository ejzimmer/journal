import { useLayoutEffect, useState } from "react"

const GAP = 4
const EDGE_BUFFER = 4

export type PopoverPlacement = "below" | "above"

type PopoverPosition = {
  placement: PopoverPlacement
  maxHeight: number
  top?: number
  bottom?: number
  left: number
  minWidth: number
}

const DEFAULT_POSITION: PopoverPosition = {
  placement: "below",
  maxHeight: 0,
  left: 0,
  minWidth: 0,
}

export function usePopoverPlacement(
  popoverState: "open" | "closed",
  anchorRef: React.RefObject<HTMLElement | null>,
  popoverRef: React.RefObject<HTMLElement | null>,
  onAnchorHidden: () => void
) {
  const [position, setPosition] = useState<PopoverPosition>(DEFAULT_POSITION)

  useLayoutEffect(() => {
    if (popoverState !== "open") return

    const measure = () => {
      const anchorEl = anchorRef.current
      const popoverEl = popoverRef.current
      if (!anchorEl || !popoverEl) return

      const anchorRect = anchorEl.getBoundingClientRect()

      // Close the popover when the anchor is scrolled out of view
      if (anchorRect.bottom <= 0 || anchorRect.top >= window.innerHeight) {
        onAnchorHidden()
        return
      }

      const spaceBelow = window.innerHeight - anchorRect.bottom - GAP - EDGE_BUFFER
      const spaceAbove = anchorRect.top - GAP - EDGE_BUFFER
      const contentHeight = popoverEl.scrollHeight

      const shared = { left: anchorRect.left, minWidth: anchorRect.width }

      // Sets top/bottom as plain numbers rather than CSS anchor positioning:
      // browsers vary in whether position-area's block-axis placement
      // updates reliably when the chosen side changes. Scroll/resize already
      // trigger a full re-measure here regardless, so anchor positioning's
      // live tracking isn't needed on top of that.
      if (contentHeight <= spaceBelow || spaceBelow >= spaceAbove) {
        setPosition({
          ...shared,
          placement: "below",
          maxHeight: Math.max(spaceBelow, 0),
          top: anchorRect.bottom + GAP,
        })
      } else {
        setPosition({
          ...shared,
          placement: "above",
          maxHeight: Math.max(spaceAbove, 0),
          bottom: window.innerHeight - anchorRect.top + GAP,
        })
      }
    }

    measure()
    window.addEventListener("scroll", measure, true)
    window.addEventListener("resize", measure)
    return () => {
      window.removeEventListener("scroll", measure, true)
      window.removeEventListener("resize", measure)
    }
  }, [popoverState, anchorRef, popoverRef, onAnchorHidden])

  return position
}
