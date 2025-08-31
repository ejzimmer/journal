import {
  Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useEffect, useCallback } from "react"
import { Destination } from "./types"

type DroppableListProps<T> = {
  list: T[]
  isDraggable: (data: Record<string, unknown>) => boolean
  getItemIndex: (data: Record<string, unknown>) => number
  onReorder: (listItems: T[]) => void
}

export function useDropTarget<T>({
  list,
  isDraggable,
  getItemIndex,
  onReorder,
}: DroppableListProps<T>) {
  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isDraggable(source.data)
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0]
        if (!target) {
          return
        }

        const sourceData = source.data
        const targetData = target.data

        if (!isDraggable(sourceData) || !isDraggable(targetData)) {
          return
        }

        const indexOfSource = getItemIndex(sourceData)
        const indexOfTarget = getItemIndex(targetData)

        if (indexOfTarget < 0 || indexOfSource < 0) {
          return
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData)
        onReorder(
          reorderWithEdge({
            list,
            startIndex: indexOfSource,
            indexOfTarget,
            closestEdgeOfTarget,
            axis: "vertical",
          })
        )
      },
    })
  }, [list, onReorder, isDraggable, getItemIndex])

  const onChangePosition = useCallback(
    (originIndex: number, destination: Destination) => {
      if (!list) return

      onReorder(
        reorderWithEdge({
          list,
          startIndex: originIndex,
          ...getTarget(originIndex, destination, list.length),
          axis: "vertical",
        })
      )
    },
    [list, onReorder]
  )

  return { onChangePosition }
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
