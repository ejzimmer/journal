export type Label = {
  text: string
  colour: string
}

export const STATUS_KEYS = ["not_started", "in_progress", "done"] as const
export type StatusKey = (typeof STATUS_KEYS)[number]

export type Item = {
  id: string
  description: string
  status: StatusKey
  items?: Record<string, Item>
  containedBy?: string[]
  lastUpdated: number
  dueDate?: number
  order?: number
  labels?: Label[]
}
