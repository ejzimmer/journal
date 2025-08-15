import { Menu } from "../../shared/controls/Menu"
import { ArrowDownIcon } from "../../shared/icons/ArrowDown"
import { ArrowToBottomIcon } from "../../shared/icons/ArrowToBottom"
import { ArrowToTopIcon } from "../../shared/icons/ArrowToTop"
import { ArrowUpIcon } from "../../shared/icons/ArrowUp"
import { DragHandleIcon } from "../../shared/icons/DragHandle"

export type MoveMenuProps = {
  description: string
  onMoveTo: (destination: "start" | "end" | "next" | "previous") => void
}

export function MoveMenu({ description, onMoveTo }: MoveMenuProps) {
  const handleMove = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowUp") {
      onMoveTo(event.shiftKey ? "start" : "previous")
    } else if (event.key === "ArrowDown") {
      onMoveTo(event.shiftKey ? "end" : "next")
    }
  }

  return (
    <Menu
      trigger={(props) => (
        <button
          {...props}
          aria-label={`move ${description}`}
          onKeyDown={handleMove}
          className="ghost"
        >
          <DragHandleIcon width="20px" />
        </button>
      )}
    >
      <Menu.Action onClick={() => onMoveTo("start")}>
        <ArrowToTopIcon width="16px" colour="var(--action-colour-dark)" />
        Move to top
      </Menu.Action>
      <Menu.Action onClick={() => onMoveTo("previous")}>
        <ArrowUpIcon width="16px" colour="var(--action-colour-dark)" />
        Move up
      </Menu.Action>
      <Menu.Action onClick={() => onMoveTo("next")}>
        <ArrowDownIcon width="16px" colour="var(--action-colour-dark)" />
        Move down
      </Menu.Action>
      <Menu.Action onClick={() => onMoveTo("end")}>
        <ArrowToBottomIcon width="16px" colour="var(--action-colour-dark)" />
        Move to bottom
      </Menu.Action>
    </Menu>
  )
}
