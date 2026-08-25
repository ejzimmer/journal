import { useLayoutEffect, useState } from "react"

const EDGE_BUFFER = 4

export type PopoverPlacement = "below" | "above"

export function usePopoverPlacement(
  popoverState: "open" | "closed",
  anchorRef: React.RefObject<HTMLElement | null>,
  popoverRef: React.RefObject<HTMLElement | null>,
  onAnchorHidden: () => void
) {
  const [placement, setPlacement] = useState<PopoverPlacement>("below")
  const [maxHeight, setMaxHeight] = useState<number>()

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

      // Measure the popover's own true edge in each placement state - not a
      // reconstructed "gap" from the anchor, which silently goes wrong (and
      // stops matching where the popover actually renders) if that gap ever
      // comes out zero or negative. This doesn't need a max-height reset
      // first: "below" grows downward from a top anchored to the trigger, and
      // "above" grows upward from a bottom anchored to the trigger, so the
      // edge each state cares about is stable regardless of any max-height
      // already applied from a previous measurement.
      const wasAbove = popoverEl.classList.contains("open-above")

      popoverEl.classList.remove("open-above")
      const belowTop = popoverEl.getBoundingClientRect().top

      popoverEl.classList.add("open-above")
      const aboveBottom = popoverEl.getBoundingClientRect().bottom

      popoverEl.classList.toggle("open-above", wasAbove)

      const spaceBelow = window.innerHeight - belowTop - EDGE_BUFFER
      const spaceAbove = aboveBottom - EDGE_BUFFER
      const contentHeight = popoverEl.scrollHeight

      if (contentHeight <= spaceBelow || spaceBelow >= spaceAbove) {
        setPlacement("below")
        setMaxHeight(Math.max(spaceBelow, 0))
      } else {
        setPlacement("above")
        setMaxHeight(Math.max(spaceAbove, 0))
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

  return { placement, maxHeight }
}
