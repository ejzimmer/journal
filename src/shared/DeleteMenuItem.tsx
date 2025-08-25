import { Menu } from "./controls/Menu"
import { ConfirmationModal } from "./controls/ConfirmationModal"
export function DeleteMenuItem({
  task,
  onDelete,
}: {
  task: { description: string }
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
