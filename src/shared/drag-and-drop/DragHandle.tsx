import { ArrowDownIcon } from "../icons/ArrowDown"
import { ArrowToBottomIcon } from "../icons/ArrowToBottom"
import { ArrowToTopIcon } from "../icons/ArrowToTop"
import { ArrowUpIcon } from "../icons/ArrowUp"
import { DragHandleIcon } from "../icons/DragHandle"
import { Menu } from "../controls/Menu"
import { Draggable } from "./types"
import { getPosition, onChangePosition } from "./utils"

type DragHandleProps = {
  list: Draggable[]
  index: number
  onReorder: (list: Draggable[]) => void
}

const iconProps = {
  width: "16px",
  colour: "var(--action-colour-dark)",
}

export function DragHandle({ list, index, onReorder }: DragHandleProps) {
  const position = getPosition(index, list.length)
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
              onChangePosition(list, index, "start", onReorder)
              onClose()
            }}
            isDisabled={position === "start"}
          >
            <ArrowToTopIcon {...iconProps} /> Move to top
          </Menu.Action>
          <Menu.Action
            onClick={() => onChangePosition(list, index, "previous", onReorder)}
            isDisabled={position === "start"}
          >
            <ArrowUpIcon {...iconProps} /> Move up
          </Menu.Action>
          <Menu.Action
            onClick={() => onChangePosition(list, index, "next", onReorder)}
            isDisabled={position === "end"}
          >
            <ArrowDownIcon {...iconProps} /> Move down
          </Menu.Action>
          <Menu.Action
            onClick={() => {
              onChangePosition(list, index, "end", onReorder)
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
