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
        <button {...props} className="ghost" aria-label="drag menu">
          <DragHandleIcon width="24px" />
        </button>
      )}
    >
      <Menu.Action
        onClick={() => onChangePosition("start")}
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
        onClick={() => onChangePosition("end")}
        isDisabled={position === "end"}
      >
        <ArrowToBottomIcon {...iconProps} /> Move to bottom
      </Menu.Action>
    </Menu>
  )
}
