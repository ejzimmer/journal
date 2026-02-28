import { Modal, ModalProps } from "./Modal"
import { ModalDialog } from "./ModalDialog"

type ModalContentsProps = {
  message: string
  onConfirm: () => void
  confirmButtonText?: string
  cancelButtonText?: string
}

export type ConfirmationModalProps = ModalContentsProps & {
  trigger: ModalProps["trigger"]
}

function ModalContents({
  message,
  onConfirm,
  confirmButtonText = "Confirm",
  cancelButtonText = "No, cancel",
}: ModalContentsProps) {
  return (
    <>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Modal.Cancel>{cancelButtonText}</Modal.Cancel>
        <Modal.Action onClick={onConfirm} className="danger">
          {confirmButtonText}
        </Modal.Action>
      </Modal.Footer>
    </>
  )
}

export function ConfirmationModal({
  trigger,
  ...props
}: ConfirmationModalProps) {
  return (
    <Modal trigger={trigger}>
      <ModalContents {...props} />
    </Modal>
  )
}

type ConfirmationModalDialogProps = ModalContentsProps & {
  isOpen: boolean
  onCancel: () => void
}

export function ConfirmationModalDialog({
  isOpen,
  onCancel,
  ...props
}: ConfirmationModalDialogProps) {
  return (
    <ModalDialog isOpen={isOpen} onCancel={onCancel}>
      <ModalContents {...props} />
    </ModalDialog>
  )
}
