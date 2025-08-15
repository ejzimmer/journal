import { Modal, ModalProps } from "./controls/Modal"

export type Props = {
  message: string
  onConfirm: () => void
  confirmButtonText?: string
  trigger: ModalProps["trigger"]
}

export function ConfirmationModal({
  message,
  onConfirm,
  confirmButtonText = "Confirm",
  trigger,
}: Props) {
  return (
    <Modal trigger={trigger}>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Modal.Cancel>No, cancel</Modal.Cancel>
        <Modal.Action onClick={onConfirm}>{confirmButtonText}</Modal.Action>
      </Modal.Footer>
    </Modal>
  )
}
