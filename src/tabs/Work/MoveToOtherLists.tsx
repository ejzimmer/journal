import { useContext } from "react"
import { Menu } from "../../shared/controls/Menu"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { ArrowRightIcon } from "../../shared/icons/ArrowRight"
import { WorkTask, WORK_KEY } from "./types"

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
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing storage context")
  }

  const otherLists = allLists.filter(
    ({ id }) => id !== currentListId && id !== doneListId,
  )

  return otherLists.map((destination) => (
    <Menu.Action
      onClick={() => {
        const position = destination.items
          ? Object.values(destination.items).reduce(
              (highest, item) =>
                item.position ? Math.max(highest, item.position) : highest,
              0,
            )
          : 0
        storageContext.addItem(`${WORK_KEY}/${destination.id}/items`, {
          ...task,
          position,
          lastUpdated: new Date().getTime(),
        })
        storageContext.deleteItem(`${WORK_KEY}/${currentListId}/items`, task)
      }}
      key={destination.id}
    >
      <ArrowRightIcon width="16px" colour="var(--action-colour-dark)" />
      {destination.description}
    </Menu.Action>
  ))
}
