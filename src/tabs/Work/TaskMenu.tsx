import { ConfirmationModal } from "../../shared/controls/ConfirmationModal"
import { Menu } from "../../shared/controls/Menu"
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
  return (
    <>
      <Menu
        trigger={(props) => (
          <button {...props} className="ghost icon">
            <svg viewBox="0 0 30 10" width="24px">
              <circle cx="5" cy="5" r="2.5" />
              <circle cx="15" cy="5" r="2.5" />
              <circle cx="25" cy="5" r="2.5" />
            </svg>
          </button>
        )}
      >
        {moveDestinations.map((destination) => (
          <Menu.Action
            key={destination.description}
            onClick={() => onMove(destination)}
          >
            ➡️ {destination.description}
          </Menu.Action>
        ))}
        <ConfirmationModal
          message={`Are you sure you want to delete ${task.description}`}
          onConfirm={onDelete}
          trigger={(triggerProps) => (
            <Menu.Action key="delete_task" {...triggerProps}>
              🗑️ Delete
            </Menu.Action>
          )}
        />

        {!task.dueDate && (
          <Menu.Action
            key="add_due_date"
            onClick={() => onChange({ ...task, dueDate: new Date().getTime() })}
          >
            📅 Add due date
          </Menu.Action>
        )}
      </Menu>
    </>
  )
}
