import { createContext } from "react"

export const HABITS = ["🇯🇵", "🇫🇷", "🧘", "🖍️", "🛼"]

export type DayData = {
  id: string
  consumed?: number
  expended?: number
  habits?: (typeof HABITS)[number][]
  trackers?: string[]
}

export type DayMonth = { day: number; month: string }

export const TrackerContext = createContext<string[] | undefined>(undefined)
