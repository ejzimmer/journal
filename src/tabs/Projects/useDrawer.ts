import { RefObject, useEffect, useRef, useState } from "react"
import { ProjectSubtask } from "../../shared/types"

type DrawerParams = {
  drawerRef: RefObject<HTMLDivElement | null>
  listRef: RefObject<HTMLOListElement | null>
  formRef: RefObject<HTMLDivElement | null>
  subtasks: ProjectSubtask[]
  isProjectLoaded: boolean
  isOpen: boolean
}

export function useDrawer({
  drawerRef,
  listRef,
  formRef,
  subtasks,
  isProjectLoaded,
  isOpen,
}: DrawerParams) {
  const [openHeight, setOpenHeight] = useState(0)
  const hasScrolledIntoView = useRef(false)

  useEffect(() => {
    const drawer = drawerRef.current
    if (!drawer || !listRef.current || !formRef.current) return

    const card = drawer.parentElement
    if (!card) return

    card.style.removeProperty("--drawer-content-width")
    drawer.style.width = "max-content"

    const contentWidth = Math.ceil(drawer.getBoundingClientRect().width)
    setOpenHeight(listRef.current.clientHeight + formRef.current.clientHeight)

    drawer.style.width = ""
    card.style.setProperty("--drawer-content-width", `${contentWidth}px`)
  }, [drawerRef, listRef, formRef, subtasks, isProjectLoaded])

  useEffect(() => {
    if (!isOpen) {
      hasScrolledIntoView.current = false
      return
    }

    const drawer = drawerRef.current
    if (hasScrolledIntoView.current || !openHeight || !drawer) return
    hasScrolledIntoView.current = true

    const cardTop = drawer.parentElement?.getBoundingClientRect().top ?? 0
    const hiddenBelowFold =
      drawer.getBoundingClientRect().top + openHeight - window.innerHeight

    if (hiddenBelowFold > 0) {
      window.scrollBy({
        top: Math.min(hiddenBelowFold, cardTop),
        behavior: "smooth",
      })
    }
  }, [drawerRef, isOpen, openHeight])

  return isOpen ? openHeight : 0
}
