import { createContext } from "react"

export const HABITS = ["🇯🇵", "🇫🇷", "🧘", "🖍️", "🛼"] as const
export type Habit = (typeof HABITS)[number]
export const isHabit = (emoji: string): emoji is Habit =>
  HABITS.includes(emoji as any)

export type DayData = {
  id: string
  consumed?: number
  expended?: number
  habits?: Record<Habit, boolean>
  trackers?: string[]
}

export type DayMonth = { day: number; month: string }

export const TrackerContext = createContext<string[] | undefined>(undefined)
