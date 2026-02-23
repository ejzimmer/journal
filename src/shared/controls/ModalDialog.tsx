import { ReactNode, useRef } from "react"
import { Modal, ModalContext } from "./Modal"

export function ModalDialog({
  isOpen,
  children,
}: {
  isOpen: boolean
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const closeModal = () => {
    dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      // @ts-ignore closedby does exist really
      closedby="any"
      open={isOpen}
      onClose={closeModal}
    >
      <ModalContext.Provider value={{ closeModal }}>
        <div className="close-button">
          <Modal.CloseButton />
        </div>
        {children}
      </ModalContext.Provider>
    </dialog>
  )
}
