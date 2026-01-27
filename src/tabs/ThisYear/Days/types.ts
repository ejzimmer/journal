import { createContext } from "react"

export const HABITS = ["🇯🇵", "🇫🇷", "🧘", "🖍️", "🛼"] as const

export type DayData = {
  id: string
  consumed?: number
  expended?: number
  habits?: Record<(typeof HABITS)[number], boolean>
  trackers?: string[]
}

export type DayMonth = { day: number; month: string }

export const TrackerContext = createContext<string[] | undefined>(undefined)
