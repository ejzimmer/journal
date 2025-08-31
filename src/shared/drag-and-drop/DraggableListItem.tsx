import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { ReactNode, useRef, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import invariant from "tiny-invariant"
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview"
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/types"
import { DragHandle } from "./DragHandle"
import { Destination, Position } from "./types"

import "./drag-and-drop.css"

type DraggingState =
  | { type: "idle" }
  | { type: "preview"; container: HTMLElement }
  | { type: "is-dragging-over"; closestEdge: Edge | null }
const IDLE: DraggingState = { type: "idle" }

type DraggableListItemProps = {
  position: Position
  onChangePosition: (destination: Destination) => void
  getData: () => Record<string, unknown>
  canDrop: (data: Record<string, unknown>) => boolean
  dragPreview: ReactNode
  children: ReactNode
}

export function DraggableListItem({
  position,
  onChangePosition,
  getData,
  canDrop,
  dragPreview,
  children,
}: DraggableListItemProps) {
  const draggableRef = useRef<HTMLDivElement | null>(null)
  const [draggingState, setDraggingState] = useState<DraggingState>(IDLE)

  useEffect(() => {
    if (!draggableRef.current) return

    const element = draggableRef.current
    invariant(element)
    return combine(
      draggable({
        element,
        getInitialData() {
          return getData()
        },
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: pointerOutsideOfPreview({
              x: "16px",
              y: "8px",
            }),
            render({ container }) {
              setDraggingState({ type: "preview", container })
            },
          })
        },
        onDrop() {
          setDraggingState(IDLE)
        },
      }),
      dropTargetForElements({
        element,
        canDrop({ source }) {
          // not allowing dropping on yourself
          if (source.element === element) {
            return false
          }

          // only allowing tasks to be dropped on me
          return canDrop(source.data)
        },
        getData({ input }) {
          const data = getData()
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          })
        },
        getIsSticky() {
          return true
        },
        onDragEnter({ self }) {
          const closestEdge = extractClosestEdge(self.data)
          setDraggingState({ type: "is-dragging-over", closestEdge })
        },
        onDrag({ self }) {
          const closestEdge = extractClosestEdge(self.data)

          // Only need to update react state if something has changed.
          // Prevents re-rendering.
          setDraggingState((current) => {
            if (
              current.type === "is-dragging-over" &&
              current.closestEdge === closestEdge
            ) {
              return current
            }
            return { type: "is-dragging-over", closestEdge }
          })
        },
        onDragLeave() {
          setDraggingState(IDLE)
        },
        onDrop() {
          setDraggingState(IDLE)
        },
      })
    )
  }, [getData, canDrop])

  return (
    <>
      <div ref={draggableRef} style={{ display: "flex", alignItems: "center" }}>
        <DragHandle position={position} onChangePosition={onChangePosition} />
        {children}
        {draggingState.type === "is-dragging-over" &&
        draggingState.closestEdge ? (
          <DropIndicator edge={draggingState.closestEdge} />
        ) : null}
      </div>
      {draggingState.type === "preview" &&
        createPortal(dragPreview, draggingState.container)}
    </>
  )
}

function DropIndicator({ edge }: { edge: Edge }) {
  return <div className={`drop-indicator ${edge}`} />
}
