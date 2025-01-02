export type Item = {
  id: string
  description: string
  isComplete: boolean
  items?: Item[]
  containedBy?: string[]
  lastUpdated: number
  dueDate?: number
}
