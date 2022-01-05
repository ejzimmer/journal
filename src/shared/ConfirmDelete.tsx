import { Button } from "@chakra-ui/button"
import { HStack } from "@chakra-ui/layout"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogOverlay,
} from "@chakra-ui/modal"
import { useRef } from "react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
}

export function ConfirmDelete({ isOpen, onClose, onDelete }: Props) {
  const cancelRef = useRef(null)

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent width="max-content">
          <AlertDialogBody mt="4">Are you sure?</AlertDialogBody>

          <AlertDialogFooter>
            <HStack spacing={2}>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onDelete}>
                Delete
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
