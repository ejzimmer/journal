import { Button } from "@chakra-ui/react"
import { HStack } from "@chakra-ui/react"
import { Dialog } from "@chakra-ui/react"
import { useRef } from "react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
}

export function ConfirmDelete({ isOpen, onClose, onDelete }: Props) {
  const cancelRef = useRef(null)

  return (
    <Dialog.Root
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      size="sm"
      role="alertdialog"
    >
      <Dialog.Backdrop>
        <Dialog.Content>
          <Dialog.Body mt="4">Are you sure?</Dialog.Body>

          <Dialog.Footer>
            <HStack gap={2}>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onDelete}>
                Delete
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Backdrop>
    </Dialog.Root>
  )
}
