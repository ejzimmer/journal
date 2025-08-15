import React, { createContext, useContext } from "react"
import { JSX, useRef } from "react"

import "./Modal.css"
import { XIcon } from "../icons/X"

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
      <dialog ref={dialogRef} className="modal">
        <ModalContext.Provider value={{ closeModal }}>
          <div className="header">
            <CloseButton />
          </div>
          {children}
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

function Footer({ children }: { children: React.ReactNode }) {
  const { closeModal } = useModal()

  return (
    <div>
      {children} <button onClick={closeModal}>Cancel</button>
    </div>
  )
}

function CloseButton() {
  const { closeModal } = useModal()

  return (
    <button
      className="ghost"
      style={{
        color: "inherit",
      }}
      aria-label="close modal"
      onClick={closeModal}
    >
      <XIcon width="24px" />
    </button>
  )
}

function Action({
  onClick,
  style,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const { closeModal } = useModal()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onClick?.(event)
    closeModal()
  }
  return (
    <button
      {...props}
      style={{ ...style, gridArea: "footer" }}
      onClick={handleClick}
    />
  )
}

Modal.Footer = Footer
Modal.Action = Action

export { Modal }
