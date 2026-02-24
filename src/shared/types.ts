import { OrderedListItem } from "./drag-and-drop/types"

export const TODO_KEY = "today"
export type TodoCategory = {
  text: string
  emoji: string
}
export type TodoTask = OrderedListItem & {
  description: string
  category: TodoCategory
}

export const DAILY_KEY = `${TODO_KEY}/日`
export type DailyTaskDetails = {
  type: "毎日" | "一度"
  status: "ready" | "done" | "finished"
  lastCompleted: number
}
export type DailyTask = DailyTaskDetails & TodoTask

export const WEEKLY_KEY = `${TODO_KEY}/週`
export type WeeklyTaskDetails = {
  frequency: number
  completed?: (number | null)[]
}
export type WeeklyTask = WeeklyTaskDetails & TodoTask

export const CALENDAR_KEY = `${TODO_KEY}/暦`

export const STATUSES = ["ready", "paused", "finished"] as const
export type CalendarTaskDetails = {
  dueDate: number
  status: (typeof STATUSES)[number]
  statusUpdateDate: number
}
export type CalendarTask = CalendarTaskDetails & TodoTask
