import { useDisclosure } from "@chakra-ui/react"
import { TaskButton } from "./TaskButton"
import { ConfirmationModal } from "../ConfirmationModal"

export type Props = {
  taskDescription: string
  onDelete: () => void
}

export function DeleteTaskButton({ taskDescription, onDelete }: Props) {
  const { onOpen, isOpen, onClose } = useDisclosure()
  return (
    <>
      <TaskButton aria-label={`Delete ${taskDescription}`} onClick={onOpen}>
        🗑️
      </TaskButton>
      <ConfirmationModal
        isOpen={isOpen}
        onConfirm={onDelete}
        onClose={onClose}
        message={`Are you sure you want to delete ${taskDescription}`}
        confirmButtonText="Delete task"
      />
    </>
  )
}
