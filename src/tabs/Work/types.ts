export const COLOURS = [
  "blue",
  "yellow",
  "purple",
  "green",
  "orange",
  "red",
] as const

export type Colour = (typeof COLOURS)[number]

export type Label = {
  value: string
  colour: Colour
}

export const STATUS_KEYS = ["not_started", "done"] as const
export type StatusKey = (typeof STATUS_KEYS)[number]

export type WorkTask = {
  id: string
  description: string
  status: StatusKey
  parentId: string
  items?: Record<string, WorkTask>
  lastStatusUpdate: number
  dueDate?: number
  position: number
  labels?: Label[]
}

export const WORK_KEY = "work"
