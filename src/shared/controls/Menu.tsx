import React, { useId } from "react"
import { forwardRef, JSX, useImperativeHandle, useRef } from "react"

import "./Menu.css"

type MenuChildrenProps = {
  onClose: () => void
}

export type MenuProps = {
  trigger: (props: MenuTriggerProps) => JSX.Element
  children: (props: MenuChildrenProps) => React.ReactNode
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void
}

export type MenuTriggerProps = {
  popoverTarget: string
  style: React.CSSProperties
}

export type MenuHandle = {
  isOpen: () => boolean
  reopen: () => void
}

const MenuBase = forwardRef<MenuHandle, MenuProps>(function Menu(
  { trigger: Trigger, children, onKeyDown },
  ref,
) {
  const id = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  // Anchor positioning (`anchor()` in Menu.css) normally links a popover
  // to its trigger implicitly, but only when the popover is opened via a
  // genuine user click/keypress on the popovertarget button. reopen()
  // below opens it programmatically (needed to keep the menu positioned
  // correctly after a keyboard-driven reorder), which does not establish
  // that implicit link - so the anchor is wired explicitly instead,
  // making it work the same way regardless of how the popover was shown.
  const anchorName = `--menu-anchor-${id.replace(/[^a-zA-Z0-9]/g, "")}`

  const closeMenu = () => {
    dialogRef.current?.hidePopover()
  }

  useImperativeHandle(ref, () => ({
    isOpen: () => dialogRef.current?.matches(":popover-open") ?? false,
    reopen: () => {
      // Force a fresh show so the anchored position is recomputed against
      // the element's current (post-move) location, rather than trusting
      // a popover that may already be open but stale, or was closed by
      // the move, to reposition or reappear on its own.
      dialogRef.current?.hidePopover()
      dialogRef.current?.showPopover()
    },
  }))

  return (
    <div style={{ position: "relative" }} onKeyDown={onKeyDown}>
      <Trigger
        popoverTarget={id}
        style={{ anchorName } as React.CSSProperties}
      />
      <div
        id={id}
        ref={dialogRef}
        className="menu"
        popover="auto"
        style={{ positionAnchor: anchorName } as React.CSSProperties}
      >
        {children({ onClose: closeMenu })}
      </div>
    </div>
  )
})

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

const Menu = Object.assign(MenuBase, { Action })

export { Menu }
