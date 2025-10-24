import { Label } from "../../shared/TaskList/types"

export function Today() {
  // today, inc every day things + things that have to happen today + 3 goals for the day
  // this week, inc things that need to be done multiple times
  // things from calendar, which can have state of nothing to do + due soon/overdue, automove to today on due date?
  // long term things. subtasks?
  // form for adding things - just one form for everything?

  return null
}

export type Item = {
  id: string
  description: string
  lastUpdated: number
  order?: number
  type: "everyday" | "goal" | "weekly" | "calendar" | "project"
  label: Label
}

type CalendarItem = Item & {
  type: "calendar"
  dueDate: number
  unactionable?: boolean
}
type WeeklyItem = Item & { type: "weekly"; frequency: number }
