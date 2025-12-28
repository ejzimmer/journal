import { Task, ROOT_LIST } from "../types"

export const PARENT_LIST = `${ROOT_LIST}/週`
export type Weekly = {
  frequency: number
  completed?: (number | undefined)[]
}
export type WeeklyTask = Weekly & Task
