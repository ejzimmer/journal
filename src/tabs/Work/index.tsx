import { useCallback, useContext, useEffect, useMemo } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Item, Label } from "../../shared/types"
import { NewListModal } from "./NewListModal"
import { TaskList } from "./TaskList"
import { hoursToMilliseconds, isSameDay } from "date-fns"
import { TaskMenu } from "./TaskMenu"
import { Skeleton } from "../../shared/controls/Skeleton"
import { getPosition, getTarget, sortByOrder } from "./drag-utils"
import { useDropTarget } from "../../shared/drag-and-drop/useDropTarget"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { Destination } from "../../shared/drag-and-drop/types"
import { LabelsContext } from "./LabelsContext"

const WORK_KEY = "work"

export function Work() {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("Missing Firebase context provider")
  }
  const { addItem, useValue, updateItem, deleteItem } = context
  const { value: lists, loading: listsLoading } = useValue<Item>(WORK_KEY)

  const doneList = useMemo(() => {
    return (
      lists && Object.values(lists).find((list) => list.description === "Done")
    )
  }, [lists])

  const onAddList = useCallback(
    (listName: string) => {
      addItem(WORK_KEY, { description: listName })
    },
    [addItem]
  )
  const onUpdateListName = (newName: string, list: Item) => {
    if (!newName) {
      return
    }
    updateItem(WORK_KEY, { ...list, description: newName })
  }
  const onDeleteList = useCallback(
    (list: Item) => {
      deleteItem(WORK_KEY, list)
    },
    [deleteItem]
  )

  const orderedLists = useMemo(
    () =>
      (lists ? sortByOrder(Object.values(lists)) : []).filter(
        (list) => list.id !== doneList?.id
      ),
    [lists, doneList]
  )

  const onChangePosition = useCallback(
    (originIndex: number, destination: Destination) => {
      if (!orderedLists) return

      const updatedLists = reorderWithEdge({
        list: orderedLists,
        startIndex: originIndex,
        ...getTarget(originIndex, destination, orderedLists.length),
        axis: "vertical", // keeping it vertical so getTarget works right, might need to change this
      })
      updateItem(
        WORK_KEY,
        updatedLists.reduce(
          (lists, list, index) => ({
            ...lists,
            [list.id]: { ...list, order: index },
          }),
          {}
        )
      )
    },
    [orderedLists, updateItem]
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
        if (isSameDay(today, task.lastUpdated)) {
          return
        }

        if (task.status === "done") {
          addItem(`${WORK_KEY}/${doneList.id}/items`, task)
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

  useDropTarget({ topLevelKey: WORK_KEY })

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
      <div
        style={{
          position: "sticky",
          top: "20px",
          zIndex: 1,
          display: "flex",
          justifyContent: "end",
        }}
      >
        <NewListModal onCreate={onAddList} />
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "stretch",
          gap: "20px",
        }}
      >
        {lists ? (
          <LabelsContext.Provider value={labels}>
            {orderedLists.map(
              (list, index) =>
                list !== doneList && (
                  <TaskList
                    parentListId={WORK_KEY}
                    position={getPosition(index, orderedLists.length)}
                    key={list.id}
                    list={list}
                    onChangeListName={(newName: string) =>
                      onUpdateListName(newName, list)
                    }
                    onChangePosition={(destination) =>
                      onChangePosition(index, destination)
                    }
                    onDelete={() => onDeleteList(list)}
                    onAddTask={(task) => {
                      const item: Partial<Item> = {
                        ...task,
                        status: "not_started",
                      }
                      console.log("adding task", item)
                      if (!task.dueDate) {
                        delete item.dueDate
                      }
                      addItem(`${WORK_KEY}/${list.id}/items`, item)
                    }}
                    onChangeTask={(task: Item) => {
                      updateItem(`${WORK_KEY}/${list.id}/items`, task)
                    }}
                    onReorderTasks={(tasks: Item[]) => {
                      updateItem(WORK_KEY, {
                        ...list,
                        items: tasks.reduce(
                          (items, task, index) => ({
                            ...items,
                            [task.id]: { ...task, order: index },
                          }),
                          {}
                        ),
                      })
                    }}
                    menu={({ task }) => (
                      <TaskMenu
                        task={task}
                        moveDestinations={Object.values(lists).filter(
                          ({ id }) => id !== list.id && id !== doneList?.id
                        )}
                        onDelete={() =>
                          deleteItem(`${WORK_KEY}/${list.id}/items`, task)
                        }
                        onMove={(destination: Item) => {
                          const position = destination.items
                            ? Object.values(destination.items).reduce(
                                (highest, item) =>
                                  item.order
                                    ? Math.max(highest, item.order)
                                    : highest,
                                0
                              )
                            : 0
                          addItem(`${WORK_KEY}/${destination.id}/items`, {
                            ...task,
                            order: position,
                          })
                          deleteItem(`${WORK_KEY}/${list.id}/items`, task)
                        }}
                        onChange={(task: Item) =>
                          updateItem(`${WORK_KEY}/${list.id}/items`, task)
                        }
                        onMoveToTop={() => {
                          if (!list.items) return

                          const resortedList = Object.fromEntries(
                            Object.entries(list.items).map(
                              ([id, item], index) => {
                                if (id !== task.id) {
                                  console.log("order", item.order)
                                  return [
                                    id,
                                    {
                                      ...item,
                                      order: (item.order ?? index) + 1,
                                    },
                                  ]
                                } else {
                                  return [id, { ...item, order: 0 }]
                                }
                              }
                            )
                          )
                          updateItem(WORK_KEY, { ...list, items: resortedList })
                        }}
                      />
                    )}
                  />
                )
            )}
          </LabelsContext.Provider>
        ) : (
          <div style={{ marginInlineEnd: "30px" }}>No lists found.</div>
        )}
      </div>
    </>
  )
}
