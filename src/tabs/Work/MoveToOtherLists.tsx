import { Menu } from "../../shared/controls/Menu"
import { useWorkStorage } from "./WorkStorageContext"
import { ArrowRightIcon } from "../../shared/icons/ArrowRight"
import { WorkTask, WORK_KEY } from "./types"
import { getAppendPosition } from "./taskPosition"

type MoveToOtherListsProps = {
  allLists: WorkTask[]
  currentListId: string
  doneListId?: string
  task: WorkTask
}

export function MoveToOtherLists({
  allLists,
  currentListId,
  doneListId,
  task,
}: MoveToOtherListsProps) {
  const { moveTask } = useWorkStorage()

  const otherLists = allLists.filter(
    ({ id }) => id !== currentListId && id !== doneListId,
  )

  return otherLists.map((destination) => (
    <Menu.Action
      onClick={() => {
        moveTask({
          task,
          movedItem: {
            ...task,
            position: getAppendPosition(destination),
            lastStatusUpdate: Date.now(),
          },
          sourceListId: `${WORK_KEY}/${currentListId}/items`,
          targetListId: `${WORK_KEY}/${destination.id}/items`,
        })
      }}
      key={destination.id}
    >
      <ArrowRightIcon width="16px" colour="var(--action-colour-dark)" />
      {destination.description}
    </Menu.Action>
  ))
}
