import { Menu } from "../../shared/controls/Menu"
import { useWorkStorage } from "./WorkStorageContext"
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
  const { addTask, deleteTask } = useWorkStorage()

  const currentList = allLists.find(({ id }) => id === currentListId)
  const otherLists = allLists.filter(
    ({ id }) => id !== currentListId && id !== doneListId,
  )

  return otherLists.map((destination) => (
    <Menu.Action
      onClick={() => {
        moveTaskBetweenLists(
          { addTask, deleteTask },
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
