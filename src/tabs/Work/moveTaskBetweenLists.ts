import { addSourceListLabel } from "./labelUtils"
import { WorkTask } from "./types"

type MoveTaskStorage = {
  moveTask: (
    currentListId: string,
    destinationListId: string,
    task: WorkTask,
    movedTask: WorkTask,
  ) => void
}

export function moveTaskBetweenLists(
  storage: MoveTaskStorage,
  task: WorkTask,
  currentListId: string,
  currentList: WorkTask | undefined,
  destinationList: WorkTask,
) {
  const position = destinationList.items
    ? Object.values(destinationList.items).reduce(
        (highest, item) =>
          item.position ? Math.max(highest, item.position) : highest,
        0,
      )
    : 0
  const movedTask = currentList
    ? addSourceListLabel(task, currentList)
    : task

  storage.moveTask(currentListId, destinationList.id, task, {
    ...movedTask,
    position,
    lastStatusUpdate: new Date().getTime(),
  })
}
