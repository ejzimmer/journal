import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/types"

export type Position = "start" | "middle" | "end"
export type Destination = "start" | "previous" | "next" | "end"

export type DraggingState =
  | { type: "idle" }
  | { type: "preview"; container: HTMLElement }
  | { type: "is-dragging-over"; closestEdge: Edge | null }
export const IDLE: DraggingState = { type: "idle" }

export const draggableTypeKey = Symbol("draggableType")

export type Draggable = {
  id: string
  position: number
}
