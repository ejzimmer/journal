import { useCallback, useEffect, useMemo, useRef } from "react"
import { NewListModal } from "./NewListModal"
import { TaskList } from "./TaskList"
import { hoursToMilliseconds, isBefore, startOfDay } from "date-fns"
import { Skeleton } from "../../shared/controls/Skeleton"
import { draggableTypeKey } from "../../shared/drag-and-drop/types"
import { LabelsContext } from "./LabelsContext"
import { WorkTask, Label, WORK_KEY } from "./types"
import { useDraggableList } from "../../shared/drag-and-drop/useDraggableList"
import { isDraggable, sortByPosition } from "../../shared/drag-and-drop/utils"
import { useDropTarget } from "../../shared/drag-and-drop/useDropTarget"
import { WorkStorageProvider, useWorkStorage } from "./WorkStorageContext"

import "./index.css"
import { MoveToOtherLists } from "./MoveToOtherLists"
import { addSourceListLabel } from "./labelUtils"

export function Work() {
  return (
    <WorkStorageProvider>
      <WorkContent />
    </WorkStorageProvider>
  )
}

function WorkContent() {
  const dropTargetRef = useRef<HTMLOListElement>(null)
  const {
    lists,
    isLoading: listsLoading,
    addList,
    addTask,
    reorderTasks,
  } = useWorkStorage()

  const doneList = useMemo(() => {
    return (
      lists && Object.values(lists).find((list) => list.description === "Done")
    )
  }, [lists])

  const orderedLists = useMemo(
    () =>
      (lists ? sortByPosition(Object.values(lists)) : []).filter(
        (list) => list.id !== doneList?.id,
      ),
    [lists, doneList],
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
        addTask(doneList.id, {
          ...task,
          lastStatusUpdate: new Date().getTime(),
        }),
      )

      const orderedNotDone = sortByPosition(notDone).map((task, index) => ({
        ...task,
        position: index,
      }))
      reorderTasks(list.id, orderedNotDone)
    })
  }, [lists, addTask, orderedLists, doneList, reorderTasks])

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
      if (!isDraggable(target)) {
        return WORK_KEY
      }

      if (source[draggableTypeKey] === target[draggableTypeKey]) {
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

  const labels = useMemo(() => {
    const uniqueLabels = new Map<string, Label>()
    orderedLists.forEach((list) => {
      list.labels?.forEach((label) => uniqueLabels.set(label.value, label))
    })
    orderedLists
      .flatMap(({ items }) => (items ? Object.values(items) : []))
      .flatMap(({ labels }) => labels)
      .filter((label) => label !== undefined)
      .forEach((label) => uniqueLabels.set(label.value, label))

    return Array.from(uniqueLabels.values())
  }, [orderedLists])

  if (listsLoading) {
    return <Skeleton numRows={3} />
  }

  return (
    <LabelsContext.Provider value={labels}>
      <div className="new-list-modal-container">
        <NewListModal onCreate={addList} />
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
                />
              ),
          )}
        </ol>
      ) : (
        <div style={{ marginInlineEnd: "30px" }}>No lists found.</div>
      )}
    </LabelsContext.Provider>
  )
}
