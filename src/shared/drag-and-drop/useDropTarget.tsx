import {
  Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useEffect, useCallback } from "react"
import { Destination } from "./types"
import { isTask } from "../../tabs/Work/drag-utils"
import { DropTargetRecord } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types"

type TaskData = { taskId: string; listId: string; position: number }

export type MoveProps = {
  taskId: string
  sourceListId: string
  targetListId: string
  targetListIndex: number
}

type DroppableListProps<T> = {
  listId: string
  list: T[]
  isDraggable: (data: Record<string, unknown>) => boolean
  isDroppable: (data: Record<string, unknown>) => boolean
  onReorderWithinList: (listItems: T[]) => void
  onMoveBetweenLists?: (props: MoveProps) => void
}

export function useDropTarget<T>({
  list,
  listId,
  isDraggable,
  isDroppable,
  onReorderWithinList: onReorder,
  onMoveBetweenLists: onMove,
}: DroppableListProps<T>) {
  const getDestinationIndex = useCallback((target?: DropTargetRecord) => {
    if (!target) {
      return 0
    }

    const closestEdge = extractClosestEdge(target.data)
    const targetIndex = target.data.position as number
    return closestEdge === "bottom" ? targetIndex + 1 : targetIndex
  }, [])

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isDraggable(source.data)
      },
      onDrop({ location, source }) {
        const sourceData = source.data as TaskData
        if (!isDraggable(sourceData) || sourceData.listId !== listId) {
          return
        }

        const dropTargets = location.current.dropTargets
        if (!dropTargets.some(({ data }) => isDroppable(data))) {
          return
        }

        const targetListId = dropTargets[0].data.listId as string
        const targetTask = dropTargets.find(({ data }) => isTask(data))
        if (sourceData.listId === targetListId) {
          if (!targetTask) {
            throw new Error(
              `No target task when dropping on same list ${dropTargets}`
            )
          }

          const targetData = targetTask.data as TaskData
          const closestEdgeOfTarget = extractClosestEdge(targetData)

          onReorder(
            reorderWithEdge({
              list,
              startIndex: sourceData.position,
              indexOfTarget: targetData.position,
              closestEdgeOfTarget,
              axis: "vertical",
            })
          )
        } else {
          const targetListIndex = getDestinationIndex(targetTask)

          onMove?.({
            taskId: sourceData.taskId,
            sourceListId: sourceData.listId,
            targetListId,
            targetListIndex,
          })
        }
      },
    })
  }, [
    list,
    onReorder,
    isDraggable,
    isDroppable,
    onMove,
    getDestinationIndex,
    listId,
  ])

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
