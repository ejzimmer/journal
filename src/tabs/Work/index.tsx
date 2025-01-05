// - can add due dates to tasks
// can reorder tasks
// can drag and drop between lists
// add subtasks
// dragging and dropping between parent/child lists - use horizontal position to determine which list to drop into
// colour code tasks
// add button to clear done tasks
// fix fonts in menu popout
// make add task form go away properly

import { useCallback, useContext, useEffect } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import {
  Box,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  Stack,
} from "@chakra-ui/react"
import { Item } from "../../shared/TaskList/types"
import { NewListModal } from "./NewListModal"
import { useConfirmDelete } from "./useConfirmDelete"
import { TaskList } from "./TaskList"
import { hoursToMilliseconds, isSameDay } from "date-fns"
import { useDeleteTask } from "../../shared/TaskList/DeleteTaskButton"

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

  const onUpdate = useCallback(() => {
    const today = new Date()
    const todayList = lists?.find((list) => list.description === "Today")
    const tomorrowList = lists?.find((list) => list.description === "Tomorrow")
    const doneList = lists?.find((list) => list.description === "Done")
    if (!todayList || !doneList) {
      return
    }

    lists?.forEach((list) => {
      if (list === doneList || !list.items) {
        return
      }

      Object.values(list.items).forEach((task) => {
        if (isSameDay(today, task.lastUpdated)) {
          return
        }

        if (task.isComplete) {
          addItemToList(`${WORK_KEY}/${doneList.id}/items`, task)
          deleteItemFromList(`${WORK_KEY}/${list.id}/items`, task)
        } else if (list === tomorrowList) {
          addItemToList(`${WORK_KEY}/${todayList.id}/items`, task)
          deleteItemFromList(`${WORK_KEY}/${list.id}/items`, task)
        }
      })
    })
  }, [lists, addItemToList, deleteItemFromList])

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
            onChangeListName={(newName: string) =>
              onUpdateListName(newName, list)
            }
            onAddTask={(description: string, dueDate?: Date) => {
              const item: Partial<Item> = {
                description,
                isComplete: false,
              }
              if (dueDate) {
                item.dueDate = dueDate?.getTime()
              }
              addItemToList(`${WORK_KEY}/${list.id}/items`, item)
            }}
            onChangeTask={(task: Item) => {
              updateItemInList(`${WORK_KEY}/${list.id}/items`, task)
            }}
            menu={({ task }) => (
              <TaskMenu
                task={task}
                moveDestinations={lists.filter(({ id }) => id !== list.id)}
                onDelete={() =>
                  deleteItemFromList(`${WORK_KEY}/${list.id}/items`, task)
                }
                onMove={(destination: Item) => {
                  addItemToList(`${WORK_KEY}/${destination.id}/items`, task)
                  deleteItemFromList(`${WORK_KEY}/${list.id}/items`, task)
                }}
                onChange={(task: Item) =>
                  updateItemInList(`${WORK_KEY}/${list.id}/items`, task)
                }
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

function TaskMenu({
  task,
  moveDestinations,
  onDelete,
  onChange,
  onMove,
}: {
  task: Item
  moveDestinations: Item[]
  onChange: (updatedTask: Item) => void
  onDelete: () => void
  onMove: (destination: Item) => void
}) {
  const { onClickDelete, ConfirmDeleteTask } = useDeleteTask(task, onDelete)

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        minWidth="24px"
        height="24px"
        padding="3px"
        alignSelf="center"
        _hover={{
          background: "hsl(200 70% 90%)",
        }}
      >
        <svg viewBox="0 0 30 10">
          <circle cx="5" cy="5" r="2.5" />
          <circle cx="15" cy="5" r="2.5" />
          <circle cx="25" cy="5" r="2.5" />
        </svg>
      </MenuButton>
      <MenuList fontFamily="Nimbus Sans" fontSize="16px">
        {moveDestinations.map((destination) => (
          <MenuItem
            key={destination.description}
            onClick={() => onMove(destination)}
          >
            ➡️ {destination.description}
          </MenuItem>
        ))}
        <MenuItem key="delete_task" onClick={onClickDelete}>
          🗑️ Delete <ConfirmDeleteTask />
        </MenuItem>
        {!task.dueDate && (
          <MenuItem
            key="add_due_date"
            onClick={() => onChange({ ...task, dueDate: new Date().getTime() })}
          >
            📅 Add due date
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  )
}
