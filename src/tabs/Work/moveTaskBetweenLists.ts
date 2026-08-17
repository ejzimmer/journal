import { ContextType } from "../../shared/FirebaseContext"
import { addSourceListLabel } from "./labelUtils"
import { WorkTask, WORK_KEY } from "./types"

export function moveTaskBetweenLists(
  storageContext: Pick<ContextType, "addItem" | "deleteItem">,
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

  storageContext.addItem(`${WORK_KEY}/${destinationList.id}/items`, {
    ...movedTask,
    position,
    lastUpdated: new Date().getTime(),
  })
  storageContext.deleteItem(`${WORK_KEY}/${currentListId}/items`, task)
}
