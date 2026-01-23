import { Task, ROOT_LIST } from "../types"

export const LIST_KEY = `${ROOT_LIST}/日`
export type Daily = {
  type: "毎日" | "一度"
  status: "ready" | "done" | "finished"
  lastCompleted: number
}
export type DailyTask = Daily & Task
