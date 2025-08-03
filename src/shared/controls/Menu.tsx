import React, { createContext, useContext } from "react"
import { JSX, useRef } from "react"

export type MenuProps = {
  trigger: (props: MenuTriggerProps) => JSX.Element
  children: React.ReactNode
}

export type MenuTriggerProps = {
  onClick: () => void
}

const MenuContext = createContext<{ closeMenu: () => void } | undefined>(
  undefined
)

function Menu({ trigger: Trigger, children }: MenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const openMenu = () => {
    dialogRef.current?.show()
  }
  const closeMenu = () => {
    dialogRef.current?.close()
  }

  return (
    <>
      <Trigger onClick={openMenu} />
      <dialog ref={dialogRef}>
        <MenuContext.Provider value={{ closeMenu }}>
          {children}
        </MenuContext.Provider>
      </dialog>
    </>
  )
}

function useMenu() {
  const context = useContext(MenuContext)

  if (!context) {
    throw new Error("Tried to access menu context outside of menu")
  }

  return context
}

function Action({
  isDisabled,
  onClick,
  children,
}: {
  isDisabled?: boolean
  onClick: (event: React.MouseEvent) => void
  children: React.ReactNode
}) {
  const { closeMenu } = useMenu()

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    onClick(event)
    closeMenu()
  }
  return (
    <button disabled={isDisabled} onClick={handleClick}>
      {children}
    </button>
  )
}

Menu.Action = Action

export { Menu }
