import { Task, ROOT_LIST } from "../types"

export const PARENT_LIST = `${ROOT_LIST}/暦`

export const STATUSES = ["ready", "paused", "finished"] as const
export type Calendar = {
  dueDate: number
  status: (typeof STATUSES)[number]
  statusUpdateDate: number
}
export type CalendarTask = Calendar & Task
