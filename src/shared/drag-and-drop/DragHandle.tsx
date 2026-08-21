import { useEffect, useRef } from "react"
import { ArrowDownIcon } from "../icons/ArrowDown"
import { ArrowToBottomIcon } from "../icons/ArrowToBottom"
import { ArrowToTopIcon } from "../icons/ArrowToTop"
import { ArrowUpIcon } from "../icons/ArrowUp"
import { DragHandleIcon } from "../icons/DragHandle"
import { Menu, MenuHandle } from "../controls/Menu"
import { Destination, OrderedListItem } from "./types"
import { getPosition, onChangePosition } from "./utils"

export type AdditionalActions = {
  menuItems?: React.ReactNode
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void
}

type DragHandleProps = {
  list: OrderedListItem[]
  index: number
  onReorder: (list: OrderedListItem[]) => void
  additionalActions?: AdditionalActions
}

const iconProps = {
  width: "16px",
  colour: "var(--action-colour-dark)",
}

export function DragHandle({
  list,
  index,
  onReorder,
  additionalActions,
}: DragHandleProps) {
  const position = getPosition(index, list.length)
  const isFirst = index === 0
  const isLast = index === list.length - 1

  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<MenuHandle>(null)
  // React keeps this same component instance across a reorder (the list
  // is keyed by item id one level up), so a plain ref survives the move.
  // Reordering can otherwise drop focus and desync the popover's anchored
  // position, so after every move we explicitly restore focus - and, if
  // requested, reopen the menu fresh at its new position - rather than
  // relying on the browser to carry that state across the move on its own.
  const pendingFocusRef = useRef<{ reopenMenu: boolean } | null>(null)

  useEffect(() => {
    if (!pendingFocusRef.current) return
    const { reopenMenu } = pendingFocusRef.current
    pendingFocusRef.current = null

    buttonRef.current?.focus()
    if (reopenMenu) {
      menuRef.current?.reopen()
    }
  })

  const move = (destination: Destination, reopenMenu: boolean) => {
    pendingFocusRef.current = { reopenMenu }
    onChangePosition(list, index, destination, onReorder)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault()
        if (!isFirst) {
          const menuIsOpen = menuRef.current?.isOpen() ?? false
          move(event.shiftKey ? "start" : "previous", menuIsOpen)
        }
        break
      case "ArrowDown":
        event.preventDefault()
        if (!isLast) {
          const menuIsOpen = menuRef.current?.isOpen() ?? false
          move(event.shiftKey ? "end" : "next", menuIsOpen)
        }
        break
      default:
        additionalActions?.onKeyDown?.(event)
    }
  }

  return (
    <Menu
      ref={menuRef}
      onKeyDown={handleKeyDown}
      trigger={(props) => (
        <button
          {...props}
          ref={buttonRef}
          className="drag-handle ghost"
          aria-label="drag menu"
        >
          <DragHandleIcon width="24px" />
        </button>
      )}
    >
      {({ onClose }) => (
        <>
          <Menu.Action
            onClick={() => {
              move("start", false)
              onClose()
            }}
            // isDisabled={position === "start"}
          >
            <ArrowToTopIcon {...iconProps} /> Move to top
          </Menu.Action>
          <Menu.Action
            onClick={() => move("previous", true)}
            // isDisabled={position === "start"}
          >
            <ArrowUpIcon {...iconProps} /> Move up
          </Menu.Action>
          <Menu.Action onClick={() => move("next", true)} isDisabled={position === "end"}>
            <ArrowDownIcon {...iconProps} /> Move down
          </Menu.Action>
          <Menu.Action
            onClick={() => {
              move("end", false)
              onClose()
            }}
            isDisabled={position === "end"}
          >
            <ArrowToBottomIcon {...iconProps} /> Move to bottom
          </Menu.Action>
          {additionalActions?.menuItems}
        </>
      )}
    </Menu>
  )
}
