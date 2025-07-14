// fix fonts in menu popout
// make add task form go away properly
// can drag and drop between lists
// add subtasks

import { useCallback, useContext, useEffect, useMemo } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Box, HStack, Skeleton, Stack } from "@chakra-ui/react"
import { Item, Label } from "../../shared/TaskList/types"
import { NewListModal } from "./NewListModal"
import { useConfirmDelete } from "./useConfirmDelete"
import { TaskList } from "./TaskList"
import { hoursToMilliseconds, isSameDay } from "date-fns"
import { TaskMenu } from "./TaskMenu"
import { DoneList } from "./DoneList"

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
    const todayList = listsAsList.find((list) => list.description === "Today")
    const tomorrowList = listsAsList.find(
      (list) => list.description === "Tomorrow"
    )
    const doneList = listsAsList.find((list) => list.description === "Done")
    if (!todayList || !doneList) {
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

        if (task.isComplete) {
          addItem(`${WORK_KEY}/${doneList.id}/items`, task)
          deleteItem(`${WORK_KEY}/${list.id}/items`, task)
        } else if (list === tomorrowList) {
          addItem(`${WORK_KEY}/${todayList.id}/items`, task)
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
    return (
      <Stack maxWidth="400px">
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    )
  }

  return (
    <HStack wrap="wrap" alignItems="stretch" gap="20px">
      <Box position="fixed" right="40px" top="60px">
        <NewListModal onCreate={onAddList} />
      </Box>

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
                      isComplete: false,
                    }
                    if (typeof dueDate === "number") {
                      item.dueDate = dueDate
                    }
                    if (labels?.length) {
                      const labelKeys = labels.map((label) =>
                        addItem(`${WORK_KEY}/labels`, label)
                      )
                      item.labels = labelKeys.filter(
                        (key): key is string => !!key
                      )
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
        <Box marginInlineEnd="30px">No lists found.</Box>
      )}
      <DeleteListConfirmation />
    </HStack>
  )
}
