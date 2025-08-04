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
      {message}
      <Modal.Action onAction={onConfirm}>{confirmButtonText}</Modal.Action>
    </Modal>
  )
}
