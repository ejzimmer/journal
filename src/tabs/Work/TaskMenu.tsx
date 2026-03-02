import { useMemo } from "react"
import { Menu } from "../../shared/controls/Menu"
import { ArrowRightIcon } from "../../shared/icons/ArrowRight"

import "./TaskList.css"
import { EllipsisIcon } from "../../shared/icons/Ellipsis"
import { WorkTask } from "./types"

export function TaskMenu({
  task,
  moveDestinations,
  onDelete,
  onChange,
  onMove,
}: {
  task: WorkTask
  moveDestinations: WorkTask[]
  onChange: (updatedTask: WorkTask) => void
  onDelete: () => void
  onMove: (destination: WorkTask) => void
  onMoveToTop: () => void
}) {
  const sortedMoveDestinations = useMemo(
    () => moveDestinations.toSorted((a, b) => a.position - b.position),
    [moveDestinations],
  )

  return (
    <>
      <Menu
        trigger={(props) => (
          <button {...props} className="task-menu ghost icon">
            <EllipsisIcon width="24px" />
          </button>
        )}
      >
        {({ onClose }) => (
          <>
            {sortedMoveDestinations.map((destination) => (
              <Menu.Action
                key={destination.description}
                onClick={() => {
                  onMove(destination)
                  onClose()
                }}
              >
                <ArrowRightIcon
                  width="16px"
                  colour="var(--action-colour-dark)"
                />
                {destination.description}
              </Menu.Action>
            ))}
          </>
        )}
      </Menu>
    </>
  )
}
