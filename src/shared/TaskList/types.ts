export type Item = {
  id: string
  description: string
  isComplete: boolean
  items?: string[]
  containedBy?: string[]
}
