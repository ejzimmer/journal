import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogOverlay,
  Button,
  HStack,
  ListItem,
  useId,
} from "@chakra-ui/react"
import { useRef, useState } from "react"
import { EditableLabel } from "./style"
import { Checkbox } from "./Checkbox"

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
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  return (
    <ListItem
      style={{
        display: "flex",
        alignItems: "center",
        paddingLeft: "1em",
        cursor: "pointer",
      }}
      opacity={isDone ? ".6" : 1}
    >
      <Checkbox
        label={title}
        isChecked={isDone}
        onChange={(event) => onDoneChange(event.target.checked)}
      />
      <EditableLabel
        aria-label="Task description"
        defaultValue={title}
        onBlur={(event) => onTitleChange(event.target.value)}
        paddingStart=".25em"
        marginStart=".25em"
        paddingTop=".3em"
        paddingBottom=".1em"
        height="unset"
        textDecoration={isDone ? "line-through" : "none"}
      />
      <Button
        aria-label={`Delete task: ${title}`}
        onClick={() => setShowDeleteConfirmation(true)}
        backgroundColor="transparent"
        opacity=".6"
        _hover={{
          backgroundColor: "transparent",
          opacity: 1,
        }}
        _active={{
          backgroundColor: "transparent",
          opacity: 1,
        }}
        transform="opacity .2s"
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
