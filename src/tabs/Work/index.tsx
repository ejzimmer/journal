import { useCallback, useContext, useEffect, useMemo, useRef } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { NewListModal } from "./NewListModal"
import { TaskList } from "./TaskList"
import { hoursToMilliseconds, isSameDay } from "date-fns"
import { TaskMenu } from "./TaskMenu"
import { Skeleton } from "../../shared/controls/Skeleton"
import { sortByOrder } from "./drag-utils"
import { draggableTypeKey } from "../../shared/drag-and-drop/types"
import { LabelsContext } from "./LabelsContext"
import { WorkTask, Label, WORK_KEY } from "./types"
import { useDraggableList } from "../../shared/drag-and-drop/useDraggableList"
import { isDraggable } from "../../shared/drag-and-drop/utils"
import { useDropTarget } from "../../shared/drag-and-drop/useDropTarget"

import "./index.css"

export function Work() {
  const dropTargetRef = useRef<HTMLOListElement>(null)
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("Missing Firebase context provider")
  }
  const { addItem, useValue, updateItem, deleteItem } = context
  const { value: lists, loading: listsLoading } =
    useValue<Record<string, WorkTask>>(WORK_KEY)

  const doneList = useMemo(() => {
    return (
      lists && Object.values(lists).find((list) => list.description === "Done")
    )
  }, [lists])

  const onAddList = useCallback(
    (listName: string) => {
      addItem(WORK_KEY, { description: listName })
    },
    [addItem],
  )

  const orderedLists = useMemo(
    () =>
      (lists ? sortByOrder(Object.values(lists)) : []).filter(
        (list) => list.id !== doneList?.id,
      ),
    [lists, doneList],
  )

  const onUpdate = useCallback(() => {
    const today = new Date()
    if (!lists) return

    if (!doneList) {
      return
    }

    orderedLists.forEach((list) => {
      if (list === doneList || !list.items) {
        return
      }

      Object.values(list.items).forEach((task) => {
        if (isSameDay(today, task.lastStatusUpdate)) {
          return
        }

        if (task.status === "done") {
          addItem<WorkTask>(`${WORK_KEY}/${doneList.id}/items`, {
            ...task,
            lastStatusUpdate: new Date().getTime(),
          })
          deleteItem(`${WORK_KEY}/${list.id}/items`, task)
        }
      })
    })
  }, [lists, addItem, deleteItem, orderedLists, doneList])

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
  })

  const labels = useMemo(() => {
    const uniqueLabels = new Map<string, Label>()
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
    <>
      <div className="new-list-modal-container">
        <NewListModal onCreate={onAddList} />
      </div>
      {lists ? (
        <LabelsContext.Provider value={labels}>
          <ol ref={dropTargetRef} className="work-lists">
            {orderedLists.map(
              (list, index) =>
                list !== doneList && (
                  <TaskList
                    key={list.id}
                    listId={list.id}
                    index={index}
                    parentListId={WORK_KEY}
                    menu={({ task }) => (
                      <TaskMenu
                        task={task}
                        moveDestinations={Object.values(lists).filter(
                          ({ id }) => id !== list.id && id !== doneList?.id,
                        )}
                        onDelete={() =>
                          deleteItem(`${WORK_KEY}/${list.id}/items`, task)
                        }
                        onMove={(destination: WorkTask) => {
                          const position = destination.items
                            ? Object.values(destination.items).reduce(
                                (highest, item) =>
                                  item.position
                                    ? Math.max(highest, item.position)
                                    : highest,
                                0,
                              )
                            : 0
                          addItem(`${WORK_KEY}/${destination.id}/items`, {
                            ...task,
                            position,
                            lastUpdated: new Date().getTime(),
                          })
                          deleteItem(`${WORK_KEY}/${list.id}/items`, task)
                        }}
                        onChange={(task: WorkTask) =>
                          updateItem(`${WORK_KEY}/${list.id}/items`, {
                            ...task,
                            lastUpdated: new Date().getTime(),
                          })
                        }
                        onMoveToTop={() => {
                          if (!list.items) return

                          const resortedList = Object.fromEntries(
                            Object.entries(list.items).map(
                              ([id, item], index) => {
                                if (id !== task.id) {
                                  return [
                                    id,
                                    {
                                      ...item,
                                      position: (item.position ?? index) + 1,
                                    },
                                  ]
                                } else {
                                  return [id, { ...item, position: 0 }]
                                }
                              },
                            ),
                          )
                          updateItem(WORK_KEY, {
                            ...list,
                            items: resortedList,
                          })
                        }}
                      />
                    )}
                  />
                ),
            )}
          </ol>
        </LabelsContext.Provider>
      ) : (
        <div style={{ marginInlineEnd: "30px" }}>No lists found.</div>
      )}
    </>
  )
}
