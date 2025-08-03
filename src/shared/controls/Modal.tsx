import React, { createContext, useContext } from "react"
import { JSX, useRef } from "react"

export type ModalProps = {
  trigger: (props: ModalTriggerProps) => JSX.Element
  children: React.ReactNode
}

export type ModalTriggerProps = {
  onClick: () => void
}

const ModalContext = createContext<{ closeModal: () => void } | undefined>(
  undefined
)

function Modal({ trigger: Trigger, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const openModal = () => {
    dialogRef.current?.showModal()
  }
  const closeModal = () => {
    dialogRef.current?.close()
  }

  return (
    <>
      <Trigger onClick={openModal} />
      <dialog ref={dialogRef}>
        <ModalContext.Provider value={{ closeModal }}>
          <button aria-label="close modal" onClick={closeModal}>
            x
          </button>
          {children}
          <button onClick={closeModal}>Cancel</button>
        </ModalContext.Provider>
      </dialog>
    </>
  )
}

function useModal() {
  const context = useContext(ModalContext)

  if (!context) {
    throw new Error("Tried to access modal context outside of modal")
  }

  return context
}

function Action({
  onAction,
  children,
}: {
  onAction: (event: React.MouseEvent) => void
  children: React.ReactNode
}) {
  const { closeModal } = useModal()

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    onAction(event)
    closeModal()
  }
  return <button onClick={handleClick}>{children}</button>
}

Modal.Action = Action

export { Modal }
