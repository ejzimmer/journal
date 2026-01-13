import { useCallback, useState } from "react"

export function usePopoverState(
  popoverRef: React.RefObject<HTMLDivElement | null>
) {
  const [popoverState, setPopoverState] = useState<"open" | "closed">("closed")

  const showPopover = useCallback(() => {
    if (popoverRef.current && popoverState !== "open") {
      setPopoverState("open")
      popoverRef.current.showPopover()
    }
  }, [popoverRef, popoverState])

  const hidePopover = useCallback(() => {
    if (popoverRef.current && popoverState !== "closed") {
      setPopoverState("closed")
      popoverRef.current.hidePopover()
    }
  }, [popoverRef, popoverState])

  const togglePopover = () =>
    popoverState === "open" ? hidePopover() : showPopover()

  return { popoverState, showPopover, hidePopover, togglePopover }
}
