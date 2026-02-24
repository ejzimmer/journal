import { createContext } from "react"

export type DayMonth = { day: number; month: string }

export const TrackerContext = createContext<string[] | undefined>(undefined)
