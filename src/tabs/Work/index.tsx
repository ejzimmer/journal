// - normal task functionality with lists
// - at the start of the Day
//   - all done tasks are removed
//   - all not-done tasks in tomorrow are moved to today
// - can add due dates to tasks
// dragging and dropping between parent/child lists - use horizontal position to determine which list to drop into

import { useContext, useState, MouseEvent, FocusEvent } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Box, Heading, HStack, Skeleton, Stack } from "@chakra-ui/react"
import { EditableText } from "../../shared/controls/EditableText"
import { Item } from "../../shared/TaskList/types"
import { NewListModal } from "./NewListModal"
import { useConfirmDelete } from "./useConfirmDelete"
import { AddTaskForm } from "../../shared/TaskList/AddTaskForm"

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
          <List
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

function List({
  list,
  onUpdateListName,
  onAddTask,
}: {
  list: Item
  onUpdateListName: (name: string) => void
  onAddTask: (description: string) => void
}) {
  const [addTaskFormVisible, setAddTaskFormVisible] = useState(false)

  const showTaskForm = (event: MouseEvent | FocusEvent) => {
    event.stopPropagation()
    setAddTaskFormVisible(true)
  }

  return (
    <Box
      key={list.id}
      minWidth="200px"
      minHeight="300px"
      background="repeating-linear-gradient(white, white 24px, hsl(200, 90%, 80%) 24px, hsl(200, 90%, 80%) 25px, white 25px)"
      cursor="text"
      onClick={showTaskForm}
      onFocus={showTaskForm}
    >
      <Heading as="h2" fontSize="20px">
        <EditableText
          label={`Edit ${list.description} name`}
          onChange={onUpdateListName}
        >
          {list.description}
        </EditableText>
      </Heading>
      {list.items &&
        Object.values(list.items).map((item) => <Box>{item.description}</Box>)}
      {addTaskFormVisible && (
        <AddTaskForm
          onSubmit={onAddTask}
          onCancel={() => setAddTaskFormVisible(false)}
        />
      )}
    </Box>
  )
}
