import React, { createContext, useContext, useId } from "react"
import { JSX, useRef } from "react"

import "./Menu.css"

export type MenuProps = {
  trigger: (props: MenuTriggerProps) => JSX.Element
  children: React.ReactNode
}

export type MenuTriggerProps = {
  popoverTarget: string
}

const MenuContext = createContext<{ closeMenu: () => void } | undefined>(
  undefined
)

function Menu({ trigger: Trigger, children }: MenuProps) {
  const id = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  const closeMenu = () => {
    dialogRef.current?.hidePopover()
  }

  return (
    <div style={{ position: "relative" }}>
      <Trigger popoverTarget={id} />
      <div id={id} ref={dialogRef} className="menu" popover="auto">
        <MenuContext.Provider value={{ closeMenu }}>
          {children}
        </MenuContext.Provider>
      </div>
    </div>
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
    <button role="menuitem" disabled={isDisabled} onClick={handleClick}>
      {children}
    </button>
  )
}

Menu.Action = Action

export { Menu }
