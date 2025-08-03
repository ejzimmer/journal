import { useState } from "react"
import { ConfirmDelete } from "./ConfirmDelete"
import { Menu } from "./controls/Menu"

export function DeleteMenuItem({ onDelete }: { onDelete: () => void }) {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleDelete = () => {
    onDelete()
  }

  return (
    <ConfirmDelete
      trigger={(props) => (
        <Menu.Action {...props}>
          <div>🗑️ Delete</div>
        </Menu.Action>
      )}
      isOpen={showConfirmation}
      onClose={() => setShowConfirmation(false)}
      onDelete={handleDelete}
    />
  )
}
