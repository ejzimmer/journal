import { Item } from "../../shared/TaskList/types"

const isTaskKey = Symbol("isTask")

export function getTaskData(task: Item) {
  return { [isTaskKey]: true, taskId: task.id }
}

export function isTask(data: any): boolean {
  return isTaskKey in data && !!data[isTaskKey]
}
