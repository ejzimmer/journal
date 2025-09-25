import React, { useId } from "react"
import { JSX, useRef } from "react"

import "./Menu.css"

type MenuChildrenProps = {
  onClose: () => void
}

export type MenuProps = {
  trigger: (props: MenuTriggerProps) => JSX.Element
  children: (props: MenuChildrenProps) => React.ReactNode
}

export type MenuTriggerProps = {
  popoverTarget: string
}

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
        {children({ onClose: closeMenu })}
      </div>
    </div>
  )
}

function Action({
  isDisabled,
  children,
  ...props
}: Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "disabled" | "onClick"
> & {
  isDisabled?: boolean
  onClick: (event: React.MouseEvent) => void
}) {
  return (
    <button {...props} role="menuitem" disabled={isDisabled}>
      {children}
    </button>
  )
}

Menu.Action = Action

export { Menu }
