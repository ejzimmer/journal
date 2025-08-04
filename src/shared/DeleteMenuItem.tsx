import { Menu } from "./controls/Menu"
import { ConfirmationModal } from "./ConfirmationModal"
import { Item } from "./TaskList/types"

export function DeleteMenuItem({
  task,
  onDelete,
}: {
  task: Item
  onDelete: () => void
}) {
  return (
    <ConfirmationModal
      trigger={(props) => (
        <Menu.Action {...props}>
          <div>🗑️ Delete</div>
        </Menu.Action>
      )}
      message={`Are you sure you want to delete ${task.description}`}
      onConfirm={onDelete}
    />
  )
}
