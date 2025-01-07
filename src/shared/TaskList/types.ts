export type Item = {
  id: string
  description: string
  isComplete: boolean
  items?: Record<string, Item>
  containedBy?: string[]
  lastUpdated: number
  dueDate?: number
  order?: number
}
