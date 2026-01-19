import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"

import { Destination, draggableTypeKey } from "../../shared/drag-and-drop/types"
import { WorkTask } from "./types"

export function isTask(data: any): boolean {
  return draggableTypeKey in data && data[draggableTypeKey] === "task"
}

export function isList(data: any): boolean {
  return draggableTypeKey in data && data[draggableTypeKey] === "list"
}
export function isDroppable(data: any): boolean {
  return draggableTypeKey in data
}

export function sortByOrder(list: WorkTask[]) {
  return list
    .toSorted((a, b) => a.position - b.position)
    .map((item, index) => ({ ...item, position: index }))
}

export function getPosition(index: number, listLength: number) {
  if (index === 0) {
    return "start"
  }
  if (index === listLength - 1) {
    return "end"
  }

  return "middle"
}

export const getTarget = (
  originIndex: number,
  destination: Destination,
  listLength: number
): {
  indexOfTarget: number
  closestEdgeOfTarget: Edge
} => {
  switch (destination) {
    case "start":
      return { indexOfTarget: 0, closestEdgeOfTarget: "top" }
    case "previous":
      return { indexOfTarget: originIndex - 1, closestEdgeOfTarget: "top" }
    case "next":
      return {
        indexOfTarget: originIndex + 1,
        closestEdgeOfTarget: "bottom",
      }
    case "end":
      return {
        indexOfTarget: listLength - 1,
        closestEdgeOfTarget: "bottom",
      }
  }
}
