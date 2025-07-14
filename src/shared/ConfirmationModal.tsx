import { Dialog, Button, Portal } from "@chakra-ui/react"

export type Props = {
  message: string
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  onConfirm: () => void
  onClose: () => void
  confirmButtonText?: string
}

export function ConfirmationModal({
  isOpen,
  setOpen,
  message,
  onClose,
  onConfirm,
  confirmButtonText = "Confirm",
}: Props) {
  return (
    <Dialog.Root
      lazyMount
      open={isOpen}
      onOpenChange={(event: { open: boolean }) => setOpen(event.open)}
      size="sm"
      role="alertdialog"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Body>
              <Dialog.Body mt="4">{message}</Dialog.Body>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button
                colorScheme="red"
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
              >
                {confirmButtonText}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
