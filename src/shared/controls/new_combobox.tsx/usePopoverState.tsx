import { useState } from "react"

export function usePopoverState(
  popoverRef: React.RefObject<HTMLDivElement | null>
) {
  const [popoverState, setPopoverState] = useState<"open" | "closed">("closed")

  const showPopover = () => {
    if (popoverRef.current && popoverState !== "open") {
      setPopoverState("open")
      popoverRef.current.showPopover()
    }
  }

  const hidePopover = () => {
    if (popoverRef.current && popoverState !== "closed") {
      setPopoverState("closed")
      popoverRef.current.hidePopover()
    }
  }

  const togglePopover = () =>
    popoverState === "open" ? hidePopover() : showPopover()

  return { popoverState, showPopover, hidePopover, togglePopover }
}
