import { useEffect, useState } from "react"
import invariant from "tiny-invariant"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"

type DragState = "idle" | "is-dragging-over"

export function useDropTarget({
  dropTargetRef,
  canDrop,
  getData,
}: {
  dropTargetRef: React.RefObject<HTMLOListElement | null>
  canDrop: Parameters<typeof dropTargetForElements>[0]["canDrop"]
  getData: Parameters<typeof dropTargetForElements>[0]["getData"]
}) {
  const [dragState, setDragState] = useState<DragState>("idle")

  useEffect(() => {
    if (!dropTargetRef.current) return

    const element = dropTargetRef.current
    invariant(element)
    return combine(
      dropTargetForElements({
        element,
        canDrop,
        getData,
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
