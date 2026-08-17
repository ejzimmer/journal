import { useContext } from "react"
import { Menu } from "../../shared/controls/Menu"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { ArrowRightIcon } from "../../shared/icons/ArrowRight"
import { WorkTask } from "./types"
import { moveTaskBetweenLists } from "./moveTaskBetweenLists"

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

  const currentList = allLists.find(({ id }) => id === currentListId)
  const otherLists = allLists.filter(
    ({ id }) => id !== currentListId && id !== doneListId,
  )

  return otherLists.map((destination) => (
    <Menu.Action
      onClick={() => {
        moveTaskBetweenLists(
          storageContext,
          task,
          currentListId,
          currentList,
          destination,
        )
      }}
      key={destination.id}
    >
      <ArrowRightIcon width="16px" colour="var(--action-colour-dark)" />
      {destination.description}
    </Menu.Action>
  ))
}
