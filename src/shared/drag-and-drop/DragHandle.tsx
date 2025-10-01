import { ArrowDownIcon } from "../icons/ArrowDown"
import { ArrowToBottomIcon } from "../icons/ArrowToBottom"
import { ArrowToTopIcon } from "../icons/ArrowToTop"
import { ArrowUpIcon } from "../icons/ArrowUp"
import { DragHandleIcon } from "../icons/DragHandle"
import { Menu } from "../controls/Menu"
import { Destination, Position } from "./types"

type DragHandleProps = {
  position: Position
  onChangePosition: (newPosition: Destination) => void
}

const iconProps = {
  width: "16px",
  colour: "var(--action-colour-dark)",
}

export function DragHandle({ position, onChangePosition }: DragHandleProps) {
  return (
    <Menu
      trigger={(props) => (
        <button {...props} className="drag-handle ghost" aria-label="drag menu">
          <DragHandleIcon width="24px" />
        </button>
      )}
    >
      {({ onClose }) => (
        <>
          <Menu.Action
            onClick={() => {
              onChangePosition("start")
              onClose()
            }}
            isDisabled={position === "start"}
          >
            <ArrowToTopIcon {...iconProps} /> Move to top
          </Menu.Action>
          <Menu.Action
            onClick={() => onChangePosition("previous")}
            isDisabled={position === "start"}
          >
            <ArrowUpIcon {...iconProps} /> Move up
          </Menu.Action>
          <Menu.Action
            onClick={() => onChangePosition("next")}
            isDisabled={position === "end"}
          >
            <ArrowDownIcon {...iconProps} /> Move down
          </Menu.Action>
          <Menu.Action
            onClick={() => {
              onChangePosition("end")
              onClose()
            }}
            isDisabled={position === "end"}
          >
            <ArrowToBottomIcon {...iconProps} /> Move to bottom
          </Menu.Action>
        </>
      )}
    </Menu>
  )
}
