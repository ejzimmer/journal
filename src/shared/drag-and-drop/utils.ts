import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import {
  Destination,
  Draggable,
  draggableTypeKey,
  OrderedListItem,
} from "./types"
import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"

export const isDraggable = (item: any): item is Draggable =>
  draggableTypeKey in item

export function getPosition(index: number, listLength: number) {
  if (index === 0) {
    return "start"
  }
  if (index === listLength - 1) {
    return "end"
  }

  return "middle"
}

export function sortByPosition<T extends OrderedListItem>(list: T[]) {
  return list
    .toSorted((a, b) => a.position - b.position)
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
  list: OrderedListItem[],
  originIndex: number,
  destination: Destination,
  onReorder: (list: OrderedListItem[]) => void
) => {
  const sortedList = sortByPosition(list)

  onReorder(
    reorderWithEdge({
      list: sortedList,
      startIndex: originIndex,
      ...getTarget(originIndex, destination, list.length),
      axis: "vertical",
    }).map((item, index) => ({ ...item, position: index }))
  )
}
