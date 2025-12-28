import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { useEffect, useCallback, useContext } from "react"
import {
  isDroppable,
  isList,
  isTask,
  sortByOrder,
} from "../../tabs/Work/drag-utils"
import { FirebaseContext } from "../FirebaseContext"
import { Item } from "../types"

type TaskData = { itemId: string; parentId: string; position: number }

export type MoveProps = {
  taskId: string
  sourceListId: string
  targetListId: string
  targetListIndex: number
}

type DroppableListProps = {
  topLevelKey: string
}

export function useDropTarget({ topLevelKey }: DroppableListProps) {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("Missing Firebase context provider")
  }
  const { updateItem, useValue, updateList, addItem, deleteItem } = context

  const { value: lists } = useValue<Item>(topLevelKey)

  const getDestinationIndex = useCallback((target?: TaskData) => {
    if (!target) {
      return 0
    }

    const closestEdge = extractClosestEdge(target)
    const targetIndex = target.position as number
    return closestEdge === "bottom" ? targetIndex + 1 : targetIndex
  }, [])

  const reorderWithinList = useCallback(
    ({
      targetList,
      targetTaskData,
      sourcePosition,
      createUpdatedObject,
      axis,
    }: {
      targetList: Item[]
      targetTaskData: TaskData
      sourcePosition: number
      createUpdatedObject: (list: Item[]) => any
      axis: "horizontal" | "vertical"
    }) => {
      const closestEdgeOfTarget = extractClosestEdge(targetTaskData)

      const reorderedList = reorderWithEdge({
        list: sortByOrder(targetList),
        startIndex: sourcePosition,
        indexOfTarget: targetTaskData.position,
        closestEdgeOfTarget,
        axis,
      })

      updateItem(topLevelKey, createUpdatedObject(reorderedList))
    },
    [topLevelKey, updateItem]
  )

  useEffect(() => {
    if (!lists) {
      return
    }

    return monitorForElements({
      canMonitor({ source }) {
        return isTask(source.data) || isList(source.data)
      },
      onDrop({ location, source }) {
        const sourceData = source.data as TaskData
        if (!isDroppable(sourceData)) {
          return
        }

        const dropTargets = location.current.dropTargets
        if (dropTargets.length === 0) {
          return
        }

        if (isTask(sourceData)) {
          const targetTaskData = dropTargets.find(({ data }) => isTask(data))
            ?.data as TaskData
          const targetListData = dropTargets.find(({ data }) =>
            isList(data)
          )?.data

          const targetListId =
            targetTaskData?.parentId ?? targetListData?.itemId
          const targetList = lists[targetListId]

          if (targetListId === sourceData.parentId) {
            reorderWithinList({
              targetList: Object.values(targetList.items ?? {}),
              targetTaskData,
              sourcePosition: sourceData.position,
              createUpdatedObject: (reorderedList) => ({
                ...targetList,
                items: reorderedList.reduce(
                  (items, task, index) => ({
                    ...items,
                    [task.id]: { ...task, order: index },
                  }),
                  {}
                ),
              }),
              axis: "vertical",
            })
          } else {
            const sourceList = lists[sourceData.parentId]
            const task = sourceList.items?.[sourceData.itemId]
            const targetListIndex = getDestinationIndex(targetTaskData)

            const updatedList = sortByOrder(
              Object.values(targetList.items ?? {})
            ).map((task) => {
              if (
                typeof task.order === "number" &&
                task.order >= targetListIndex
              ) {
                return {
                  ...task,
                  order: task.order + 1,
                }
              }

              return task
            })
            updateList(`${topLevelKey}/${targetListId}/items`, updatedList)

            addItem(`${topLevelKey}/${targetListId}/items`, {
              ...task,
              order: targetListIndex,
            })
            deleteItem(`${topLevelKey}/${sourceList.id}/items`, task)
          }
        } else if (isList(sourceData)) {
          const targetListData = dropTargets.find(({ data }) => isList(data))
            ?.data as TaskData
          if (!targetListData) {
            throw new Error("Could not find target list")
          }

          reorderWithinList({
            targetList: Object.values(lists),
            targetTaskData: targetListData,
            sourcePosition: sourceData.position,
            createUpdatedObject: (updatedList) =>
              updatedList.reduce(
                (lists, list, index) => ({
                  ...lists,
                  [list.id]: { ...list, order: index },
                }),
                {}
              ),
            axis: "horizontal",
          })
        }
      },
    })
  }, [
    addItem,
    deleteItem,
    getDestinationIndex,
    lists,
    reorderWithinList,
    topLevelKey,
    updateList,
  ])
}
