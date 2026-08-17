import { Menu } from "../../shared/controls/Menu"
import { useWorkStorage } from "./WorkStorageContext"
import { ArrowRightIcon } from "../../shared/icons/ArrowRight"
import { WorkTask } from "./types"
import { addSourceListLabel } from "./labelUtils"

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
        const position = destination.items
          ? Object.values(destination.items).reduce(
              (highest, item) =>
                item.position ? Math.max(highest, item.position) : highest,
              0,
            )
          : 0
        const movedTask = currentList
          ? addSourceListLabel(task, currentList)
          : task
        addTask(destination.id, {
          ...movedTask,
          position,
          lastStatusUpdate: new Date().getTime(),
        })
        deleteTask(currentListId, task)
      }}
      key={destination.id}
    >
      <ArrowRightIcon width="16px" colour="var(--action-colour-dark)" />
      {destination.description}
    </Menu.Action>
  ))
}
