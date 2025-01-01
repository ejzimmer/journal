import { useDisclosure } from "@chakra-ui/react"
import { TaskButton } from "./TaskButton"
import { ConfirmationModal } from "../ConfirmationModal"
import { Item } from "./types"

export type Props = {
  taskDescription: string
  onDelete: () => void
}

export const useDeleteTask = (task: Item, onDelete: () => void) => {
  const { onOpen, isOpen, onClose } = useDisclosure()

  return {
    onClickDelete: onOpen,
    ConfirmDeleteTask: () => (
      <ConfirmationModal
        isOpen={isOpen}
        onConfirm={onDelete}
        onClose={onClose}
        message={`Are you sure you want to delete ${task.description}`}
        confirmButtonText="Delete task"
      />
    ),
  }
}

export function DeleteTaskButton({ taskDescription, onDelete }: Props) {
  // Pass in a dummy task so we don't need to change the API of this component
  // to use the above hook. Replace this component with hook when practicable
  const { onClickDelete, ConfirmDeleteTask } = useDeleteTask(
    {
      description: taskDescription,
      id: "",
      isComplete: false,
      lastUpdated: new Date().getTime(),
    },
    onDelete
  )
  return (
    <>
      <TaskButton
        aria-label={`Delete ${taskDescription}`}
        onClick={onClickDelete}
      >
        🗑️
      </TaskButton>
      <ConfirmDeleteTask />
    </>
  )
}
