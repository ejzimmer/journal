import { Task, ROOT_LIST } from "../types"

export const PARENT_LIST = `${ROOT_LIST}/暦`
export type Calendar = { dueDate: number; status: "ready" | "finished" }
export type CalendarTask = Calendar & Task
