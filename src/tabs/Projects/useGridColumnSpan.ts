import { RefObject, useLayoutEffect } from "react"
import { ProjectDetails } from "../../shared/types"

export function useGridColumnSpan(
  itemRef: RefObject<HTMLElement | null>,
  project: ProjectDetails,
  isVisible: boolean,
) {
  useLayoutEffect(() => {
    const item = itemRef.current
    if (!item || !isVisible) return

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
    item.style.setProperty("--col-span", String(columnSpan))
  }, [itemRef, project, isVisible])
}
