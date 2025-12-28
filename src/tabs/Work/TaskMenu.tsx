import { useMemo, useState } from "react"
import { ConfirmationModal } from "../../shared/controls/ConfirmationModal"
import { Menu } from "../../shared/controls/Menu"
import { ArrowRightIcon } from "../../shared/icons/ArrowRight"
import { RubbishBinIcon } from "../../shared/icons/RubbishBin"
import { Item } from "../../shared/types"

import "./TaskList.css"
import { ModalTriggerProps } from "../../shared/controls/Modal"
import { PostitModal } from "./PostitModal"

export function TaskMenu({
  task,
  moveDestinations,
  onDelete,
  onChange,
  onMove,
}: {
  task: Item
  moveDestinations: Item[]
  onChange: (updatedTask: Item) => void
  onDelete: () => void
  onMove: (destination: Item) => void
  onMoveToTop: () => void
}) {
  const sortedMoveDestinations = useMemo(
    () =>
      moveDestinations.toSorted(
        (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)
      ),
    [moveDestinations]
  )

  return (
    <>
      <Menu
        trigger={(props) => (
          <button {...props} className="task-menu ghost icon">
            <svg viewBox="0 0 30 10" width="24px">
              <circle cx="5" cy="5" r="2.5" />
              <circle cx="15" cy="5" r="2.5" />
              <circle cx="25" cy="5" r="2.5" />
            </svg>
          </button>
        )}
      >
        {({ onClose }) => (
          <>
            {!task.dueDate && (
              <Menu.Action
                onClick={() =>
                  onChange({ ...task, dueDate: new Date().getTime() })
                }
              >
                📅 Add due date
              </Menu.Action>
            )}

            <PostitModal
              message={`Are you sure you want to delete ${task.description}?`}
              onConfirm={onDelete}
              trigger={(triggerProps) => <DeleteButton {...triggerProps} />}
            />

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

function DeleteButton(props: ModalTriggerProps) {
  const [isHovered, setHovered] = useState(false)

  return (
    <Menu.Action
      {...props}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <RubbishBinIcon width="16px" shouldAnimate={isHovered} /> Delete
    </Menu.Action>
  )
}
