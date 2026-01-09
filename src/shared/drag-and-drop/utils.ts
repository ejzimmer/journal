import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { Destination, Draggable } from "./types"
import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"

export function getPosition(index: number, listLength: number) {
  if (index === 0) {
    return "start"
  }
  if (index === listLength - 1) {
    return "end"
  }

  return "middle"
}

export function sortByOrder(list: Draggable[]) {
  return list
    .toSorted((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))
    .map((item, index) => ({ ...item, position: index }))
}

const getTarget = (
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

export const onChangePosition = (
  list: Draggable[],
  originIndex: number,
  destination: Destination,
  onReorder: (list: Draggable[]) => void
) => {
  const sortedList = sortByOrder(list)

  onReorder(
    reorderWithEdge({
      list: sortedList,
      startIndex: originIndex,
      ...getTarget(originIndex, destination, list.length),
      axis: "vertical",
    })
  )
}
