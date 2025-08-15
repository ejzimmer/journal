import { useCallback, useContext, useEffect, useMemo } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Item, Label } from "../../shared/TaskList/types"
import { NewListModal } from "./NewListModal"
import { useConfirmDelete } from "./useConfirmDelete"
import { TaskList } from "./TaskList"
import { hoursToMilliseconds, isSameDay } from "date-fns"
import { TaskMenu } from "./TaskMenu"
import { DoneList } from "./DoneList"
import { Skeleton } from "../../shared/controls/Skeleton"

const WORK_KEY = "work"

export function Work() {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("Missing Firebase context provider")
  }
  const { addItem, useValue, updateItem, deleteItem } = context
  const { value: lists, loading: listsLoading } = useValue<Item>(WORK_KEY)
  const { value: labels } = useValue<Label>(`${WORK_KEY}/labels`)

  const doneList = useMemo(() => {
    return (
      lists && Object.values(lists).find((list) => list.description === "Done")
    )
  }, [lists])
  const defaultList = lists && Object.values(lists)[0]

  const onAddList = (listName: string) => {
    addItem(WORK_KEY, { description: listName })
  }
  const onUpdateListName = (newName: string, list: Item) => {
    if (!newName) {
      confirmDelete(list)
      return
    }
    updateItem(WORK_KEY, { ...list, description: newName })
  }
  const onDeleteList = (list: Item) => {
    deleteItem(WORK_KEY, list)
  }
  const { confirmDelete, DeleteListConfirmation } =
    useConfirmDelete(onDeleteList)

  const onUpdate = useCallback(() => {
    const today = new Date()
    if (!lists) return

    const listsAsList = Object.values(lists)
    const doneList = listsAsList.find((list) => list.description === "Done")
    if (!doneList) {
      return
    }

    listsAsList.forEach((list) => {
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
  }, [lists, addItem, deleteItem])

  useEffect(() => {
    onUpdate()
    const interval = setInterval(onUpdate, hoursToMilliseconds(1))

    return () => clearInterval(interval)
  }, [onUpdate])

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
          <>
            {Object.entries(lists).map(
              ([id, list]) =>
                list !== doneList && (
                  <TaskList
                    key={id}
                    list={list}
                    labels={labels}
                    onChangeListName={(newName: string) =>
                      onUpdateListName(newName, list)
                    }
                    onDelete={() => confirmDelete(list)}
                    onAddTask={({ description, dueDate, labels }) => {
                      const item: Partial<Item> = {
                        description,
                        status: "not_started",
                      }
                      if (typeof dueDate === "number") {
                        item.dueDate = dueDate
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
                          ({ id }) => id !== list.id
                        )}
                        onDelete={() =>
                          deleteItem(`${WORK_KEY}/${list.id}/items`, task)
                        }
                        onMove={(destination: Item) => {
                          addItem(`${WORK_KEY}/${destination.id}/items`, task)
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
            {doneList?.items && (
              <DoneList
                tasks={doneList.items}
                onMarkNotDone={(task) => {
                  if (!defaultList) return

                  addItem(`${WORK_KEY}/${defaultList.id}/items`, {
                    ...task,
                    isComplete: false,
                  })
                  deleteItem(`${WORK_KEY}/${doneList.id}/items`, task)
                }}
                onDelete={(task) =>
                  deleteItem(`${WORK_KEY}/${doneList.id}/items`, task)
                }
              />
            )}
          </>
        ) : (
          <div style={{ marginInlineEnd: "30px" }}>No lists found.</div>
        )}
        <DeleteListConfirmation />
      </div>
    </>
  )
}
