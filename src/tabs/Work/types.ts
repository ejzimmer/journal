import { COLOURS } from "../../shared/types"

export type Label = {
  value: string
  colour: (typeof COLOURS)[number]
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
