import React, { createContext, useContext } from "react"
import { JSX, useRef } from "react"

import "./Modal.css"
import { XIcon } from "../icons/X"

export type ModalProps = {
  trigger: (props: ModalTriggerProps) => JSX.Element
  onClose?: () => void
  children: React.ReactNode
}

export type ModalTriggerProps = {
  onClick: () => void
}

const ModalContext = createContext<{ closeModal: () => void } | undefined>(
  undefined
)

function Modal({ trigger: Trigger, onClose, children }: ModalProps) {
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
      <dialog
        ref={dialogRef}
        className="modal"
        // @ts-ignore closedby does exist really
        closedby="any"
        onClose={onClose}
      >
        <ModalContext.Provider value={{ closeModal }}>
          <div className="close-button">
            <CloseButton />
          </div>
          {children}
        </ModalContext.Provider>
      </dialog>
    </>
  )
}

export function useModal() {
  const context = useContext(ModalContext)

  if (!context) {
    throw new Error("Tried to access modal context outside of modal")
  }

  return context
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
      <XIcon width="16px" />
    </button>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return <div style={{ gridArea: "body" }}>{children}</div>
}

function Footer({ children }: { children: React.ReactNode }) {
  return <div className="footer">{children}</div>
}

function Action({
  onClick,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const { closeModal } = useModal()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      event.preventDefault()
      onClick(event)
      closeModal()
    }
  }
  return <button {...props} onClick={handleClick} />
}

function Cancel({ children }: { children: React.ReactNode }) {
  const { closeModal } = useModal()

  return (
    <button className="outline" onClick={closeModal} type="button">
      {children}
    </button>
  )
}

Modal.Body = Body
Modal.Footer = Footer
Modal.Action = Action
Modal.Cancel = Cancel

export { Modal }
