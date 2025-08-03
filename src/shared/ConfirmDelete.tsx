import { Modal, ModalProps } from "./controls/Modal"

interface Props {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
  trigger: ModalProps["trigger"]
}

export function ConfirmDelete({ onClose, onDelete, trigger }: Props) {
  return (
    <Modal trigger={trigger}>
      Are you sure?
      <Modal.Action onAction={onDelete}>Delete</Modal.Action>
    </Modal>
  )
}
