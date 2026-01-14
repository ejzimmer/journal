import { COLOURS } from "../../shared/types"

export type Label = {
  value: string
  colour: (typeof COLOURS)[number]
}

export const STATUS_KEYS = ["not_started", "done"] as const
export type StatusKey = (typeof STATUS_KEYS)[number]

export type Item = {
  id: string
  description: string
  status: StatusKey
  items?: Record<string, Item>
  lastUpdated: number
  dueDate?: number
  order?: number
  labels?: Label[]
}
