import { Modal, ModalProps } from "./controls/Modal"

export type Props = {
  message: string
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  onConfirm: () => void
  onClose: () => void
  confirmButtonText?: string
  trigger: ModalProps["trigger"]
}

export function ConfirmationModal({
  message,
  onClose,
  onConfirm,
  confirmButtonText = "Confirm",
  trigger,
}: Props) {
  return (
    <Modal trigger={trigger}>
      {message}
      <Modal.Action
        onAction={() => {
          onConfirm()
        }}
      >
        {confirmButtonText}
      </Modal.Action>
    </Modal>
  )
}
