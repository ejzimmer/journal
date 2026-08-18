import { addSourceListLabel } from "./labelUtils"
import { WorkTask } from "./types"

type MoveTaskStorage = {
  addTask: (
    listId: string,
    task: Partial<WorkTask> & { description: string },
  ) => void
  deleteTask: (listId: string, task: WorkTask) => void
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

  storage.addTask(destinationList.id, {
    ...movedTask,
    position,
    lastStatusUpdate: new Date().getTime(),
  })
  storage.deleteTask(currentListId, task)
}
