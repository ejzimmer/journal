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
      if (
        event.target instanceof Node &&
        !elementRef.current?.contains(event.target)
      ) {
        onClickOutside()
      }
    }

    if (shouldListen) window.addEventListener("click", handler)

    return () => {
      window.removeEventListener("click", handler)
    }
  }, [onClickOutside, elementRef, shouldListen])
}
