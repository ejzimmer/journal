import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useEffect, useCallback, useContext } from "react"
import { FirebaseContext } from "../FirebaseContext"
import { Draggable } from "./types"
import { isDraggable, sortByPosition } from "./utils"

export function useDraggableList<T extends Draggable>(listId: string) {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("Missing Firebase context provider")
  }
  const { useValue, updateList, addItem, deleteItem } = context

  const { value } = useValue<T>(listId)

  const getDestinationIndex = useCallback((target?: Draggable) => {
    if (!target) {
      return 0
    }

    const closestEdge = extractClosestEdge(target)
    const targetIndex = target.position as number
    return closestEdge === "bottom" ? targetIndex + 1 : targetIndex
  }, [])

  const updatePosition = useCallback(
    ({
      list,
      dropTargetData,
      sourcePosition,
      axis,
    }: {
      list: Draggable[]
      dropTargetData: Draggable
      sourcePosition: number
      axis: "horizontal" | "vertical"
    }) => {
      const closestEdgeOfTarget = extractClosestEdge(dropTargetData)

      const reorderedList = reorderWithEdge({
        list: sortByPosition(list),
        startIndex: sourcePosition,
        indexOfTarget: dropTargetData.position,
        closestEdgeOfTarget,
        axis,
      }).map((item, index) => ({ ...item, position: index }))

      updateList(listId, reorderedList)
    },
    [listId, updateList]
  )

  useEffect(() => {
    if (!value) {
      return
    }

    return monitorForElements({
      canMonitor({ source }) {
        return isDraggable(source.data)
      },
      onDrop({ location, source }) {
        const sourceData = source.data as Draggable
        if (!isDraggable(sourceData)) {
          return
        }

        const dropTargets = location.current.dropTargets
        if (dropTargets.length === 0) {
          return
        }

        const dropTargetData = dropTargets[0].data as Draggable
        const targetListId =
          isDraggable(dropTargetData) && dropTargetData.parentId

        if (targetListId !== sourceData.parentId) {
          return
        }
        const list = Object.values(value)

        updatePosition({
          list,
          dropTargetData,
          sourcePosition: sourceData.position,
          axis: "vertical",
        })
      },
    })
  }, [
    value,
    addItem,
    deleteItem,
    getDestinationIndex,
    updatePosition,
    updateList,
  ])
}
