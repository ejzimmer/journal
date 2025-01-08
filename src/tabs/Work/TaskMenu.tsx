import { Menu, MenuButton, Button, MenuList, MenuItem } from "@chakra-ui/react"
import { useDeleteTask } from "../../shared/TaskList/DeleteTaskButton"
import { Item } from "../../shared/TaskList/types"

export function TaskMenu({
  task,
  moveDestinations,
  onDelete,
  onChange,
  onMove,
  onMoveToTop,
}: {
  task: Item
  moveDestinations: Item[]
  onChange: (updatedTask: Item) => void
  onDelete: () => void
  onMove: (destination: Item) => void
  onMoveToTop: () => void
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
      <MenuList fontFamily="sans-serif" fontSize="16px">
        <MenuItem key="move_to_top" onClick={onMoveToTop}>
          ⬆️ Move to top
        </MenuItem>
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
