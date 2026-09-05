import { addSourceListLabel } from "./labelUtils"
import { WorkTask, WORK_KEY } from "./types"

type MoveTaskStorage = {
  moveTask: (args: {
    task: WorkTask
    movedItem: WorkTask
    sourceListId: string
    targetListId: string
  }) => void
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

  storage.moveTask({
    task,
    movedItem: {
      ...movedTask,
      position,
      lastStatusUpdate: new Date().getTime(),
    },
    sourceListId: `${WORK_KEY}/${currentListId}/items`,
    targetListId: `${WORK_KEY}/${destinationList.id}/items`,
  })
}
