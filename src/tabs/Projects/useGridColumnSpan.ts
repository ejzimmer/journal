import { RefObject, useLayoutEffect, useRef } from "react"
import { ProjectDetails } from "../../shared/types"

export function useGridColumnSpan(
  itemRef: RefObject<HTMLElement | null>,
  project: ProjectDetails,
  isVisible: boolean,
) {
  const lastColumnSpanRef = useRef<number | undefined>(undefined)

  useLayoutEffect(() => {
    const item = itemRef.current
    if (!item || !isVisible) return

    const measureColumnSpan = () => {
      const style = getComputedStyle(item)
      const columnUnit = parseFloat(style.getPropertyValue("--grid-unit"))
      const gap = parseFloat(style.getPropertyValue("--shelf-gap"))

      item.style.width = "max-content"
      const naturalWidth = item.getBoundingClientRect().width
      item.style.width = ""

      const columnSpan = Math.max(
        1,
        Math.ceil((naturalWidth + gap) / (columnUnit + gap)),
      )

      if (columnSpan !== lastColumnSpanRef.current) {
        lastColumnSpanRef.current = columnSpan
        item.style.setProperty("--col-span", String(columnSpan))
      }
    }

    measureColumnSpan()

    let cancelled = false
    let frame = 0

    document.fonts?.ready.then(() => {
      if (!cancelled) measureColumnSpan()
    })

    const card = item.firstElementChild
    if (
      !(card instanceof HTMLElement) ||
      typeof ResizeObserver === "undefined"
    ) {
      return () => {
        cancelled = true
      }
    }

    const resizeObserver = new ResizeObserver(() => measureOnNextFrame())

    let observedName: Element | null = null
    const observeProjectName = () => {
      const name = card.querySelector(".project-name")
      if (name === observedName) return

      if (observedName) resizeObserver.unobserve(observedName)
      observedName = name
      if (name) resizeObserver.observe(name)
    }

    const measureOnNextFrame = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (cancelled) return
        measureColumnSpan()
        observeProjectName()
      })
    }

    resizeObserver.observe(card)

    const mainRow = card.querySelector(".project-main-row")
    if (mainRow) resizeObserver.observe(mainRow)

    observeProjectName()

    const measureWhenCardSettles = (event: TransitionEvent) => {
      if (event.target === card && event.propertyName === "min-width") {
        measureOnNextFrame()
      }
    }
    card.addEventListener("transitionend", measureWhenCardSettles)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      card.removeEventListener("transitionend", measureWhenCardSettles)
    }
  }, [itemRef, project, isVisible])
}
