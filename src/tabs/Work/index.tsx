import { useCallback, useContext, useEffect, useMemo, useRef } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { NewListModal } from "./NewListModal"
import { TaskList } from "./TaskList"
import { hoursToMilliseconds, isBefore, startOfDay } from "date-fns"
import { Skeleton } from "../../shared/controls/Skeleton"
import { draggableTypeKey } from "../../shared/drag-and-drop/types"
import { LabelsProvider } from "./LabelsProvider"
import { WorkTask, Label, LABELS_KEY, WORK_KEY } from "./types"
import { migrateLegacyLabels } from "./migrateLegacyLabels"
import { useDraggableList } from "../../shared/drag-and-drop/useDraggableList"
import { isDraggable, sortByPosition } from "../../shared/drag-and-drop/utils"
import { useDropTarget } from "../../shared/drag-and-drop/useDropTarget"

import "./index.css"
import { MoveToOtherLists } from "./MoveToOtherLists"
import { addSourceListLabel } from "./labelUtils"
import { moveTaskBetweenLists } from "./moveTaskBetweenLists"
import {
  AdjacentListDestination,
  getAdjacentListIndex,
} from "./adjacentList"

export function Work() {
  const dropTargetRef = useRef<HTMLOListElement>(null)
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("Missing Firebase context provider")
  }
  const { addItem, updateItem, useValue, updateList } = context
  const { value: lists, loading: listsLoading } =
    useValue<Record<string, WorkTask>>(WORK_KEY)
  const { value: existingLabelsById, loading: labelsLoading } =
    useValue<Record<string, Label>>(LABELS_KEY)

  const hasMigratedLegacyLabels = useRef(false)
  useEffect(() => {
    if (hasMigratedLegacyLabels.current || listsLoading || labelsLoading) {
      return
    }
    hasMigratedLegacyLabels.current = true
    if (lists) {
      migrateLegacyLabels(lists, Object.values(existingLabelsById ?? {}), {
        addItem,
        updateItem,
      })
    }
  }, [
    lists,
    listsLoading,
    existingLabelsById,
    labelsLoading,
    addItem,
    updateItem,
  ])

  const doneList = useMemo(() => {
    return (
      lists && Object.values(lists).find((list) => list.description === "Done")
    )
  }, [lists])

  const onAddList = useCallback(
    (listName: string, labelIds: string[] = []) => {
      addItem(WORK_KEY, {
        description: listName,
        ...(labelIds.length > 0 && { labelIds }),
      })
    },
    [addItem],
  )

  const orderedLists = useMemo(
    () =>
      (lists ? sortByPosition(Object.values(lists)) : []).filter(
        (list) => list.id !== doneList?.id,
      ),
    [lists, doneList],
  )

  const moveTaskToAdjacentList = useCallback(
    (
      task: WorkTask,
      currentListId: string,
      destination: AdjacentListDestination,
    ) => {
      const currentIndex = orderedLists.findIndex(
        (list) => list.id === currentListId,
      )
      if (currentIndex === -1) {
        return
      }

      const targetIndex = getAdjacentListIndex(
        currentIndex,
        orderedLists.length,
        destination,
      )

      const targetList = orderedLists[targetIndex]
      if (!targetList || targetList.id === currentListId) {
        return
      }

      moveTaskBetweenLists(
        context,
        task,
        currentListId,
        orderedLists[currentIndex],
        targetList,
      )
    },
    [orderedLists, context],
  )

  const onUpdate = useCallback(() => {
    if (!lists) return

    if (!doneList) {
      return
    }

    orderedLists.forEach((list) => {
      if (list === doneList || !list.items) {
        return
      }

      const { done, notDone } = Object.values(list.items).reduce(
        (
          { done, notDone }: { done: WorkTask[]; notDone: WorkTask[] },
          task,
        ) => {
          if (
            task.status === "done" &&
            isBefore(task.lastStatusUpdate, startOfDay(new Date()))
          ) {
            done.push(task)
          } else {
            notDone.push(task)
          }

          return { done, notDone }
        },
        {
          done: [],
          notDone: [],
        },
      )

      done.forEach((task) =>
        addItem<WorkTask>(`${WORK_KEY}/${doneList.id}/items`, {
          ...task,
          lastStatusUpdate: new Date().getTime(),
        }),
      )

      const orderedNotDone = sortByPosition(notDone).map((task, index) => ({
        ...task,
        position: index,
      }))
      updateList<WorkTask>(`${WORK_KEY}/${list.id}/items`, orderedNotDone)
    })
  }, [lists, addItem, orderedLists, doneList, updateList])

  useEffect(() => {
    onUpdate()
    const interval = setInterval(onUpdate, hoursToMilliseconds(1))

    return () => clearInterval(interval)
  }, [onUpdate])

  useDropTarget({
    dropTargetRef,
    canDrop: ({ source }) => isDraggable(source.data),
    getData: () => ({ id: WORK_KEY }),
  })
  useDraggableList({
    listId: WORK_KEY,
    canDropSourceOnTarget: (source, target) => {
      if (!isDraggable(target)) {
        return source[draggableTypeKey] === "list"
      }

      if (source[draggableTypeKey] === target[draggableTypeKey]) {
        return true
      }

      if (
        source[draggableTypeKey] === "task" &&
        target[draggableTypeKey] === "list"
      ) {
        return true
      }

      return false
    },
    getTargetListId: (source, target) => {
      if (
        isDraggable(target) &&
        source[draggableTypeKey] === target[draggableTypeKey]
      ) {
        return target.parentId
      }

      return `${WORK_KEY}/${target.id}/items`
    },
    getAxis: (source) => {
      return source[draggableTypeKey] === "task" ? "vertical" : "horizontal"
    },
    onMove: (item: WorkTask, sourceListId: string) => {
      const [, sourceListKey] = sourceListId.split("/")
      const sourceList = sourceListKey ? lists?.[sourceListKey] : undefined
      return sourceList ? addSourceListLabel(item, sourceList) : item
    },
  })

  const usedLabelIds = useMemo(() => {
    const ids = new Set<string>()
    orderedLists.forEach((list) => {
      list.labelIds?.forEach((id) => ids.add(id))
      Object.values(list.items ?? {}).forEach((task) => {
        task.labelIds?.forEach((id) => ids.add(id))
      })
    })
    return ids
  }, [orderedLists])

  if (listsLoading) {
    return <Skeleton numRows={3} />
  }

  return (
    <LabelsProvider usedLabelIds={usedLabelIds}>
      <div className="new-list-modal-container">
        <NewListModal onCreate={onAddList} />
      </div>
      {lists ? (
        <ol ref={dropTargetRef} className="work-lists">
          {orderedLists.map(
            (list) =>
              list !== doneList && (
                <TaskList
                  key={list.id}
                  listId={list.id}
                  index={list.position}
                  parentListId={WORK_KEY}
                  additionalMoveDestinations={(task: WorkTask) => (
                    <MoveToOtherLists
                      allLists={orderedLists}
                      currentListId={list.id}
                      doneListId={doneList?.id}
                      task={task}
                    />
                  )}
                  onMoveTaskToAdjacentList={(task, destination) =>
                    moveTaskToAdjacentList(task, list.id, destination)
                  }
                />
              ),
          )}
        </ol>
      ) : (
        <div style={{ marginInlineEnd: "30px" }}>No lists found.</div>
      )}
    </LabelsProvider>
  )
}
