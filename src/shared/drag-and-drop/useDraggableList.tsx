import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useEffect, useCallback, useContext } from "react"
import { FirebaseContext } from "../FirebaseContext"
import {
  Draggable,
  DropTarget,
  OrderedListItem,
  draggableTypeKey,
} from "./types"
import { isDraggable, sortByPosition } from "./utils"

type UseDraggableArgs = {
  listId: string
  canDropSourceOnTarget: (source: Draggable, target: DropTarget) => boolean
  getTargetListId: (source: Draggable, target: DropTarget) => string
  getAxis: (source: Draggable) => "horizontal" | "vertical"
}

export function useDraggableList<
  T extends Omit<OrderedListItem, typeof draggableTypeKey>,
>({
  listId,
  canDropSourceOnTarget,
  getTargetListId,
  getAxis,
}: UseDraggableArgs) {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("Missing Firebase context provider")
  }
  const { useValue, updateList, addItem, deleteItem } = context

  const { value } = useValue<Record<string, T>>(listId)

  const getDestinationIndex = useCallback((target?: DropTarget) => {
    if (!isDraggable(target)) {
      return 0
    }

    const closestEdge = extractClosestEdge(target)
    const targetIndex = target.position as number
    return closestEdge === "bottom" ? targetIndex + 1 : targetIndex
  }, [])

  const getItemByPath = useCallback(
    (path: string, value: Record<string, any>) => {
      const relativePath = path.replace(`${listId}`, "").replace(/^\//, "")
      if (!relativePath) {
        return value
      }
      const pathSegments = relativePath.split("/")

      let target = value[pathSegments[0]]
      for (let i = 1; i < pathSegments.length; i++) {
        target = target[pathSegments[i]]
      }

      return target
    },
    [listId],
  )

  const updatePosition = useCallback(
    ({
      listId,
      dropTargetData,
      sourcePosition,
      axis,
    }: {
      listId: string
      dropTargetData: DropTarget
      sourcePosition: number
      axis: "horizontal" | "vertical"
    }) => {
      if (!isDraggable(dropTargetData) || !value) {
        return
      }

      const list = getItemByPath(listId, value) as Record<string, T>
      const closestEdgeOfTarget = extractClosestEdge(dropTargetData)

      const reorderedList = reorderWithEdge({
        list: sortByPosition(Object.values(list)),
        startIndex: sourcePosition,
        indexOfTarget: dropTargetData.position,
        closestEdgeOfTarget,
        axis,
      }).map((item, index) => ({ ...item, position: index }))

      updateList(listId, reorderedList)
    },
    [updateList, value, getItemByPath],
  )

  useEffect(() => {
    if (!value) {
      return
    }

    return monitorForElements({
      canMonitor({ source, initial: { dropTargets } }) {
        const dropTargetData = dropTargets[0]?.data as DropTarget
        return (
          dropTargetData &&
          isDraggable(source.data) &&
          canDropSourceOnTarget(source.data, dropTargetData)
        )
      },
      onDrop({ location, source }) {
        const sourceData = source.data as Draggable
        if (!isDraggable(sourceData) || !location.current.dropTargets.length) {
          return
        }

        const dropTargets = location.current.dropTargets
        const dropTargetData = dropTargets[0].data as DropTarget
        const targetListId = getTargetListId(sourceData, dropTargetData)

        if (sourceData.parentId === targetListId) {
          updatePosition({
            listId: targetListId,
            dropTargetData,
            sourcePosition: sourceData.position,
            axis: getAxis(sourceData),
          })
        } else if (
          isDraggable(dropTargetData) &&
          dropTargetData[draggableTypeKey] === sourceData[draggableTypeKey]
        ) {
          const targetListIndex = getDestinationIndex(dropTargetData)
          const targetList = getItemByPath(targetListId, value) as Record<
            string,
            T
          >
          const sortedTarget = sortByPosition(Object.values(targetList))

          // Make a space for the new item
          updateList(
            targetListId,
            sortedTarget.map((item) =>
              item.position < targetListIndex
                ? item
                : { ...item, position: item.position + 1 },
            ),
          )

          // Add the new item to the list
          const item = getItemByPath(
            `${sourceData.parentId}/${sourceData.id}`,
            value,
          )
          addItem(targetListId, {
            ...item,
            position: targetListIndex,
          })

          // Remove the item from the old list
          deleteItem(sourceData.parentId, item)
        } else {
          const list = getItemByPath(sourceData.parentId, value)
          const item = list[sourceData.id]

          addItem(targetListId, item)
          deleteItem(sourceData.parentId, item)
        }
      },
    })
  }, [
    value,
    addItem,
    deleteItem,
    getDestinationIndex,
    updatePosition,
    updateList,
    canDropSourceOnTarget,
    getTargetListId,
    getAxis,
    getItemByPath,
  ])
}
