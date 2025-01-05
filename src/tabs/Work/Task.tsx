import {
  Box,
  Button,
  Checkbox,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"
import { useDeleteTask } from "../../shared/TaskList/DeleteTaskButton"
import { ItemDescription } from "../../shared/TaskList/ItemDescription"
import { Item } from "../../shared/TaskList/types"
import { EditableDate } from "./EditableDate"

export function Task({
  task,
  onChange,
  onDelete,
  actions,
}: {
  task: Item
  onChange: (task: Item) => void
  onDelete: () => void
  actions?: { label: string; action: () => void }[]
}) {
  const { onClickDelete, ConfirmDeleteTask } = useDeleteTask(task, onDelete)

  return (
    <Box
      display="flex"
      alignItems="baseline"
      opacity={task.isComplete ? 0.4 : 1}
    >
      <Checkbox
        aria-label={`${task.description}`}
        isChecked={task.isComplete}
        onChange={() => {
          const isComplete = !task.isComplete
          onChange({ ...task, isComplete })
        }}
        colorScheme="gray"
      />
      <Box flexGrow="1">
        <ItemDescription
          description={task.description}
          onChange={(description) => onChange({ ...task, description })}
          isDone={task.isComplete}
        />
        {task.dueDate && (
          <EditableDate
            value={task.dueDate}
            onChange={(dueDate) => {
              console.log("due date", dueDate)
              onChange({ ...task, dueDate })
            }}
          />
        )}
      </Box>
      {actions?.length && (
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
            {actions.map(({ label, action }) => (
              <MenuItem key={label} onClick={action}>
                {label}
              </MenuItem>
            ))}
            <MenuItem key="delete_task" onClick={onClickDelete}>
              🗑️ Delete
            </MenuItem>
          </MenuList>
        </Menu>
      )}
      <ConfirmDeleteTask />
    </Box>
  )
}
