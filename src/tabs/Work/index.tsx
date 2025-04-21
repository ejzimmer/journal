// colour code tasks
// add button to clear done tasks
// fix fonts in menu popout
// make add task form go away properly
// can drag and drop between lists
// add subtasks
// dragging and dropping between parent/child lists - use horizontal position to determine which list to drop into

import { useCallback, useContext, useEffect } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Box, HStack, Skeleton, Stack } from "@chakra-ui/react"
import { Item, Label } from "../../shared/TaskList/types"
import { NewListModal } from "./NewListModal"
import { useConfirmDelete } from "./useConfirmDelete"
import { TaskList } from "./TaskList"
import { hoursToMilliseconds, isSameDay } from "date-fns"
import { TaskMenu } from "./TaskMenu"

const WORK_KEY = "work"

export function Work() {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("Missing Firebase context provider")
  }
  const { addItem, useValue, updateItem, deleteItem } = context
  const { value: lists, loading: listsLoading } = useValue<Item>(WORK_KEY)
  const { value: labels } = useValue<Label>(`${WORK_KEY}/labels`)

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
      {lists ? (
        Object.entries(lists).map(([id, list]) => (
          <TaskList
            key={id}
            list={list}
            labels={labels}
            onChangeListName={(newName: string) =>
              onUpdateListName(newName, list)
            }
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
                item.labels = labelKeys.filter((key): key is string => !!key)
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
                    Object.entries(list.items).map(([id, item]) => {
                      if (id !== task.id) {
                        return [
                          id,
                          { ...item, order: (item.order ?? Infinity) + 1 },
                        ]
                      } else {
                        return [id, { ...item, order: 0 }]
                      }
                    })
                  )
                  updateItem(WORK_KEY, { ...list, items: resortedList })
                }}
              />
            )}
          />
        ))
      ) : (
        <Box marginInlineEnd="30px">No lists found.</Box>
      )}
      <Box alignSelf="end">
        <NewListModal onCreate={onAddList} />
      </Box>
      <DeleteListConfirmation />
    </HStack>
  )
}
