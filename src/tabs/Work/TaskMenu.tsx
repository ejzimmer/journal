import { Menu } from "../../shared/controls/Menu"
import { useDeleteTask } from "../../shared/TaskList/DeleteTaskButton"
import { Item } from "../../shared/TaskList/types"

import "./TaskList.css"

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
      <Menu
        trigger={(props) => (
          <button {...props} className="menu-trigger">
            <svg viewBox="0 0 30 10">
              <circle cx="5" cy="5" r="2.5" />
              <circle cx="15" cy="5" r="2.5" />
              <circle cx="25" cy="5" r="2.5" />
            </svg>
          </button>
        )}
      >
        <Menu.Action
          key="move_to_top"
          onClick={onMoveToTop}
          isDisabled={task.order === 0}
        >
          ⬆️ Move to top
        </Menu.Action>
        {moveDestinations.map((destination) => (
          <Menu.Action
            key={destination.description}
            onClick={() => onMove(destination)}
          >
            ➡️ {destination.description}
          </Menu.Action>
        ))}
        <Menu.Action key="delete_task" onClick={onClickDelete}>
          🗑️ Delete
        </Menu.Action>
        {!task.dueDate && (
          <Menu.Action
            key="add_due_date"
            onClick={() => onChange({ ...task, dueDate: new Date().getTime() })}
          >
            📅 Add due date
          </Menu.Action>
        )}
      </Menu>
      <ConfirmDeleteTask />
    </>
  )
}
