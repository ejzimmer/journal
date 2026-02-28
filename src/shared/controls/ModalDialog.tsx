import { ReactNode, useEffect, useRef } from "react"
import { Modal, ModalContext } from "./Modal"

export function ModalDialog({
  isOpen,
  onCancel,
  children,
}: {
  isOpen: boolean
  onCancel: () => void
  children: ReactNode
}) {
  const modalState = useRef<"open" | "closed">("closed")
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (modalState.current === "closed" && isOpen) {
      modalState.current = "open"
      dialogRef.current?.showModal()
    }
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      // @ts-ignore closedby does exist really
      closedby="any"
      onClose={() => {
        modalState.current = "closed"
        onCancel()
      }}
    >
      <ModalContext.Provider
        value={{ closeModal: () => dialogRef.current?.close() }}
      >
        <div className="close-button">
          <Modal.CloseButton />
        </div>
        {children}
      </ModalContext.Provider>
    </dialog>
  )
}
