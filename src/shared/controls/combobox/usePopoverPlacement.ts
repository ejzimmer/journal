import { useLayoutEffect, useState } from "react"

const EDGE_BUFFER = 4
const FALLBACK_GAP = 4

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

      // Environments without real layout (e.g. jsdom in tests) report every
      // element as a zero rect at the origin. There's nothing meaningful to
      // measure or reposition against, so leave the default placement as-is.
      if (anchorRect.width === 0 && anchorRect.height === 0) return

      // If the anchor has scrolled out of view entirely, a positioned
      // popover would be left floating with nothing to point at, so close
      // it instead of trying to place it relative to an invisible anchor.
      if (anchorRect.bottom <= 0 || anchorRect.top >= window.innerHeight) {
        onAnchorHidden()
        return
      }

      // The browser's actual anchor->popover gap (position-area + margin)
      // can't be reliably predicted from the CSS alone, so probe both
      // placements directly via the DOM. Only the near edge (the one
      // pinned to the anchor) is read from each probe, which stays
      // accurate regardless of any max-height already applied.
      const wasAbove = popoverEl.classList.contains("open-above")

      popoverEl.classList.remove("open-above")
      const belowGap = popoverEl.getBoundingClientRect().top - anchorRect.bottom

      popoverEl.classList.add("open-above")
      const aboveGap = anchorRect.top - popoverEl.getBoundingClientRect().bottom

      popoverEl.classList.toggle("open-above", wasAbove)

      const resolvedBelowGap = belowGap > 0 ? belowGap : FALLBACK_GAP
      const resolvedAboveGap = aboveGap > 0 ? aboveGap : FALLBACK_GAP

      const spaceBelow =
        window.innerHeight - anchorRect.bottom - resolvedBelowGap - EDGE_BUFFER
      const spaceAbove = anchorRect.top - resolvedAboveGap - EDGE_BUFFER
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
