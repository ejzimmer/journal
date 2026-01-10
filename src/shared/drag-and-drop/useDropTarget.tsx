import { useEffect, useState } from "react"
import invariant from "tiny-invariant"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { isDraggable } from "./utils"

type DragState = "idle" | "is-dragging-over"

export function useDropTarget(
  dropTargetRef: React.RefObject<HTMLUListElement | null>,
  listId: string
) {
  const [dragState, setDragState] = useState<DragState>("idle")

  useEffect(() => {
    if (!dropTargetRef.current) return

    const element = dropTargetRef.current
    invariant(element)
    return combine(
      dropTargetForElements({
        element,
        canDrop({ source }) {
          return isDraggable(source.data)
        },
        getData() {
          return { listId }
        },
        onDragEnter() {
          setDragState("is-dragging-over")
        },
        onDragLeave() {
          setDragState("idle")
        },
        onDrop() {
          setDragState("idle")
        },
      })
    )
  })

  return dragState
}
