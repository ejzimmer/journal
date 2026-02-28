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
  linkedTask?: string
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

export const THIS_YEAR_PATH = "2026"

export const DAILY_PATH = `${THIS_YEAR_PATH}/daily`
export const HABITS = ["🇯🇵", "🇫🇷", "🧘", "🖍️", "🛼"] as const
export type Habit = (typeof HABITS)[number]
export type DayData = {
  id: string
  consumed?: number
  expended?: number
  habits?: Record<Habit, boolean>
  trackers?: string[]
}
export const isHabit = (emoji: string): emoji is Habit =>
  HABITS.includes(emoji as any)

export const PROJECTS_KEY = "projects"
export type ProjectSubtask = {
  id: string
  description: string
  status: "ready" | "done"
  linkedId?: string
  category: Category
}
export const PROJECT_COLOURS = {
  "🛒": "hsl(197 36% 70% /.3)",
  "📓": "hsl(0  0% 49% / .3)",
  "🖊️": "hsl(209 79% 48% /.3)",
  "👩‍💻": "hsl(93 90% 45% / .3)",
  "🧹": "hsl(45 100% 76% / .3)",
  "🪡": "hsl(203 85% 77% / .3)",
  "🧶": "hsl(339 78% 67% / .3)",
  "🚚": "hsl(352 90% 45% / .3)",
}
export const categories = Object.keys(PROJECT_COLOURS)
export type Category = keyof typeof PROJECT_COLOURS
export type ProjectDetails = {
  id: string
  description: string
  category: Category
  status?: "ready" | "in_progress" | "done"
  subtasks?: Record<string, ProjectSubtask>
}
