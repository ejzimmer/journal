import { useEffect } from "react"

export function useClickOutside({
  elementRef,
  onClickOutside,
  shouldListen = true,
}: {
  elementRef: React.RefObject<HTMLElement | null>
  onClickOutside: () => void
  shouldListen?: boolean
}) {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const element = elementRef.current
      if (!element) return

      if (event.target instanceof Node && !element.contains(event.target)) {
        onClickOutside()
      }
    }

    // mousedown, not click: the press that opens the element lands before this
    // listener is attached, but the click it produces does not, so listening
    // for click closes the element on the very interaction that opened it.
    if (shouldListen) window.addEventListener("mousedown", handler)

    return () => {
      window.removeEventListener("mousedown", handler)
    }
  }, [onClickOutside, elementRef, shouldListen])
}
