import { Modal, ModalProps } from "./Modal"

export type Props = {
  message: string
  onConfirm: () => void
  confirmButtonText?: string
  cancelButtonText?: string
  trigger: ModalProps["trigger"]
}

export function ConfirmationModal({
  message,
  onConfirm,
  confirmButtonText = "Confirm",
  cancelButtonText = "No, cancel",
  trigger,
}: Props) {
  return (
    <Modal trigger={trigger}>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Modal.Cancel>{cancelButtonText}</Modal.Cancel>
        <Modal.Action onClick={onConfirm} className="danger">
          {confirmButtonText}
        </Modal.Action>
      </Modal.Footer>
    </Modal>
  )
}
