import { RefObject, useEffect, useRef } from "react"

type ScrollIntoViewParams = {
  sectionRef: RefObject<HTMLDivElement | null>
  openHeight: number
  isOpen: boolean
}

export function useScrollIntoViewWhenOpened({
  sectionRef,
  openHeight,
  isOpen,
}: ScrollIntoViewParams) {
  const hasScrolledIntoView = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      hasScrolledIntoView.current = false
      return
    }

    const section = sectionRef.current
    if (hasScrolledIntoView.current || !openHeight || !section) return
    hasScrolledIntoView.current = true

    const cardTop = section.parentElement?.getBoundingClientRect().top ?? 0
    const hiddenBelowFold =
      section.getBoundingClientRect().top + openHeight - window.innerHeight

    if (hiddenBelowFold > 0) {
      window.scrollBy({
        top: Math.min(hiddenBelowFold, cardTop),
        behavior: "smooth",
      })
    }
  }, [isOpen, openHeight, sectionRef])
}
