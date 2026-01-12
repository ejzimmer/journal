import { useEffect } from "react"

export function useClickOutside({
  elementRef,
  onClickOutside,
}: {
  elementRef: React.RefObject<HTMLElement | null>
  onClickOutside: () => void
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
    window.addEventListener("click", handler)

    return () => {
      window.removeEventListener("click", handler)
    }
  }, [onClickOutside, elementRef])
}
