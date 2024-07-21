import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  Button,
  HStack,
} from "@chakra-ui/react"
import { useRef } from "react"

export type Props = {
  message: string
  isOpen: boolean
  onConfirm: () => void
  onClose: () => void
  confirmButtonText?: string
}

export function ConfirmationModal({
  isOpen,
  message,
  onClose,
  onConfirm,
  confirmButtonText = "Confirm",
}: Props) {
  const cancelRef = useRef(null)
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogContent width="max-content">
        <AlertDialogBody mt="4">{message}</AlertDialogBody>

        <AlertDialogFooter>
          <HStack spacing={2}>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                onConfirm()
                onClose()
              }}
            >
              {confirmButtonText}
            </Button>
          </HStack>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
