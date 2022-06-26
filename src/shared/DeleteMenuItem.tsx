import { MenuItem, Box } from "@chakra-ui/react"
import { useState } from "react"
import { ConfirmDelete } from "./ConfirmDelete"

export function DeleteMenuItem({ onDelete }: { onDelete: () => void }) {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleDelete = () => {
    onDelete()
  }

  return (
    <MenuItem onClick={() => setShowConfirmation(true)}>
      <Box>Delete</Box>
      <ConfirmDelete
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onDelete={() => handleDelete()}
      />
    </MenuItem>
  )
}
