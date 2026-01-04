import { useEffect, useState } from "react"

export function usePopoverState(
  popoverRef: React.RefObject<HTMLDivElement | null>
) {
  const [popoverState, setPopoverState] = useState<"open" | "closed">("closed")

  useEffect(() => {
    if (!popoverRef.current) {
      return
    }

    const showPopover = popoverRef.current?.showPopover.bind(popoverRef.current)
    popoverRef.current.showPopover = function () {
      setPopoverState("open")
      showPopover()
    }

    const hidePopover = popoverRef.current?.hidePopover.bind(popoverRef.current)
    popoverRef.current.hidePopover = function () {
      setPopoverState("closed")
      hidePopover()
    }
  }, [popoverRef])

  return popoverState
}
