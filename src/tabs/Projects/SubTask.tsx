import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogOverlay,
  Button,
  Checkbox,
  HStack,
  ListItem,
  useId,
} from "@chakra-ui/react"
import { useRef, useState } from "react"
import { EditableLabel } from "./style"

type Props = {
  title: string
  isDone: boolean
  onDoneChange: (done: boolean) => void
  onTitleChange: (title: string) => void
  onDelete: () => void
}

export function SubTask({
  title,
  isDone,
  onDoneChange,
  onTitleChange,
  onDelete,
}: Props) {
  const checkboxId = useId()
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  return (
    <ListItem
      style={{
        display: "flex",
        alignItems: "baseline",
        flexGrow: "1",
        paddingLeft: "1em",
        cursor: "pointer",
      }}
    >
      <Checkbox
        id={checkboxId}
        backgroundColor="white"
        border="none"
        size="lg"
        isChecked={isDone}
        onChange={(event) => onDoneChange(event.target.checked)}
      />
      <label
        style={{ width: 0, height: 0, overflow: "hidden", position: "fixed" }}
        htmlFor={checkboxId}
      >
        {title}
      </label>
      <EditableLabel
        aria-label="Task description"
        defaultValue={title}
        onBlur={(event) => onTitleChange(event.target.value)}
      />
      <Button
        aria-label={`Delete task: ${title}`}
        onClick={() => setShowDeleteConfirmation(true)}
      >
        🗑️
      </Button>
      <ConfirmDelete
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        task={title}
        onDelete={onDelete}
      />
    </ListItem>
  )
}

function ConfirmDelete({
  isOpen,
  onClose,
  task,
  onDelete,
}: {
  isOpen: boolean
  onClose: () => void
  task: string
  onDelete: () => void
}) {
  const noRef = useRef<HTMLButtonElement>(null)

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={noRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent width="max-content">
          <AlertDialogBody mt="4">
            Are you sure you want to delete {task}?
          </AlertDialogBody>

          <AlertDialogFooter>
            <HStack spacing={2}>
              <Button ref={noRef} onClick={onClose}>
                No
              </Button>
              <Button colorScheme="red" onClick={onDelete}>
                Yes
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
