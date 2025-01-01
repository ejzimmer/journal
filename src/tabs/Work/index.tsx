// - can add due dates to tasks
// can reorder tasks
// can drag and drop between lists
// add subtasks
// dragging and dropping between parent/child lists - use horizontal position to determine which list to drop into
// keep all done tasks, just don't show them. have a way to show done tasks & clear before a certain date (so i can use them for performance reviews)

import { useContext, useEffect } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Box, HStack, Skeleton, Stack } from "@chakra-ui/react"
import { Item } from "../../shared/TaskList/types"
import { NewListModal } from "./NewListModal"
import { useConfirmDelete } from "./useConfirmDelete"
import { TaskList } from "./TaskList"
import { hoursToMilliseconds, isSameDay } from "date-fns"

const WORK_KEY = "work"

export function Work() {
  const { addItemToList, useValue, updateItemInList, deleteItemFromList } =
    useContext(FirebaseContext)
  const { value: lists, loading: listsLoading } = useValue(WORK_KEY)

  const onAddList = (listName: string) => {
    addItemToList(WORK_KEY, { description: listName })
  }
  const onUpdateListName = (newName: string, list: Item) => {
    if (!newName) {
      confirmDelete(list)
      return
    }
    updateItemInList(WORK_KEY, { ...list, description: newName })
  }
  const onDeleteList = (list: Item) => {
    deleteItemFromList(WORK_KEY, list)
  }
  const { confirmDelete, DeleteListConfirmation } =
    useConfirmDelete(onDeleteList)

  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date()
      const todayList = lists?.find((list) => list.description === "Today")
      const tomorrowList = lists?.find(
        (list) => list.description === "Tomorrow"
      )
      lists?.forEach((list) => {
        list.items?.forEach((task) => {
          if (task.isComplete && !isSameDay(today, task.lastUpdated)) {
            deleteItemFromList(`${WORK_KEY}/${list.id}/items`, task)
          } else if (
            list === tomorrowList &&
            todayList &&
            !isSameDay(today, task.lastUpdated)
          ) {
            addItemToList(`${WORK_KEY}/${todayList.id}/items`, task)
            deleteItemFromList(`${WORK_KEY}/${list.id}/items`, task)
          }
        })
      })
    }, hoursToMilliseconds(1))

    return () => clearInterval(interval)
  }, [])

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
            onChangeListName={(newName: string) =>
              onUpdateListName(newName, list)
            }
            onAddTask={(description: string) => {
              addItemToList(`${WORK_KEY}/${list.id}/items`, {
                description,
                isComplete: false,
              })
            }}
            onChangeTask={(task: Item) => {
              updateItemInList(`${WORK_KEY}/${list.id}/items`, task)
            }}
            onDeleteTask={(task: Item) =>
              deleteItemFromList(`${WORK_KEY}/${list.id}/items`, task)
            }
            onMoveTask={(task: Item, destination: Item) => {
              addItemToList(`${WORK_KEY}/${destination.id}/items`, task)
              deleteItemFromList(`${WORK_KEY}/${list.id}/items`, task)
            }}
            moveDestinations={lists.filter(({ id }) => id !== list.id)}
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
