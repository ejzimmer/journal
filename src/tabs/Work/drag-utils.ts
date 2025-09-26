import { Item } from "../../shared/TaskList/types"

export const draggableTypeKey = Symbol("draggableType")

export function getTaskData(task: Item, listId: string) {
  return {
    [draggableTypeKey]: "task",
    taskId: task.id,
    listId,
    position: task.order,
  }
}

export function getListData(list: Item) {
  return { [draggableTypeKey]: "list", listId: list.id }
}

export function isTask(data: any): boolean {
  return draggableTypeKey in data && data[draggableTypeKey] === "task"
}

export function isDroppable(data: any): boolean {
  return draggableTypeKey in data
}

export function sortByOrder(list: Item[]) {
  return list
    .toSorted((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
    .map((item, index) => ({ ...item, order: index }))
}
