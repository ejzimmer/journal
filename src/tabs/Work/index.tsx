// - add task
// - mark task as done
// - edit task
// - delete task
// - at the start of the Day
//   - all done tasks are removed
//   - all not-done tasks in tomorrow are moved to today
// - can add due dates to tasks
// can reorder tasks
// can drag and drop between lists
// add subtasks
// dragging and dropping between parent/child lists - use horizontal position to determine which list to drop into

import { useContext } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Box, HStack, Skeleton, Stack } from "@chakra-ui/react"
import { Item } from "../../shared/TaskList/types"
import { NewListModal } from "./NewListModal"
import { useConfirmDelete } from "./useConfirmDelete"
import { TaskList } from "./TaskList"

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
    <HStack wrap="wrap" alignItems="end" gap="20px">
      {lists ? (
        Object.entries(lists).map(([id, list]) => (
          <TaskList
            key={id}
            list={list}
            onUpdateListName={(newName: string) =>
              onUpdateListName(newName, list)
            }
            onAddTask={(description: string) => {
              addItemToList(`${WORK_KEY}/${list.id}/items`, {
                description,
                isComplete: false,
              })
            }}
          />
        ))
      ) : (
        <Box marginInlineEnd="30px">No lists found.</Box>
      )}
      <NewListModal onCreate={onAddList} />
      <DeleteListConfirmation />z
    </HStack>
  )
}
