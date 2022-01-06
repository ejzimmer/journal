import { IconButton } from "@chakra-ui/button"
import { CloseIcon } from "@chakra-ui/icons"
import { useState } from "react"
import { ConfirmDelete } from "./ConfirmDelete"

interface Props {
  label: string
  onDelete: () => void
}

export function DeleteButton({ label, onDelete }: Props) {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const confirmDelete = () => setShowConfirmation(true)
  const closeConfirmation = () => setShowConfirmation(false)
  const deleteThing = () => {
    onDelete()
    closeConfirmation()
  }

  return (
    <>
      <IconButton
        variant="ghost"
        color="gray.400"
        _hover={{
          color: "red.500",
        }}
        icon={<CloseIcon />}
        aria-label={label}
        onClick={confirmDelete}
      />
      <ConfirmDelete
        isOpen={showConfirmation}
        onClose={closeConfirmation}
        onDelete={deleteThing}
      />
    </>
  )
}
