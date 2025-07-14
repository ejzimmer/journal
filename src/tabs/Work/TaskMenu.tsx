import { Menu, Button } from "@chakra-ui/react"
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
    <>
      <Menu.Root>
        <Menu.Trigger asChild>
          <Button
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
          </Button>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item
              key="move_to_top"
              value="move_to_top"
              onClick={onMoveToTop}
              isDisabled={task.order === 0}
            >
              ⬆️ Move to top
            </Menu.Item>
            {moveDestinations.map((destination) => (
              <Menu.Item
                key={destination.description}
                value={destination.description}
                onClick={() => onMove(destination)}
              >
                ➡️ {destination.description}
              </Menu.Item>
            ))}
            <Menu.Item
              key="delete_task"
              value="delete_task"
              onClick={onClickDelete}
            >
              🗑️ Delete
            </Menu.Item>
            {!task.dueDate && (
              <Menu.Item
                key="add_due_date"
                value="add_due_date"
                onClick={() =>
                  onChange({ ...task, dueDate: new Date().getTime() })
                }
              >
                📅 Add due date
              </Menu.Item>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
      <ConfirmDeleteTask />
    </>
  )
}
