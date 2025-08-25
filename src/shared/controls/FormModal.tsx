import { Modal, ModalProps, useModal } from "./Modal"

export type FormModalProps = {
  children: React.ReactNode
  onSubmit: (event: React.FormEvent) => boolean | Promise<boolean>
  submitButtonText?: string
  onClose?: () => void
  trigger: ModalProps["trigger"]
}

export function FormModal({ trigger, onClose, ...props }: FormModalProps) {
  return (
    <Modal trigger={trigger} onClose={onClose}>
      <FormBody {...props} />
    </Modal>
  )
}

function FormBody({
  submitButtonText,
  onSubmit,
  children,
}: Omit<FormModalProps, "trigger" | "onClose">) {
  const { closeModal } = useModal()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (await onSubmit(event)) {
      closeModal()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Body>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Modal.Cancel>Cancel</Modal.Cancel>
        <Modal.Action className="primary">{submitButtonText}</Modal.Action>
      </Modal.Footer>
    </form>
  )
}
