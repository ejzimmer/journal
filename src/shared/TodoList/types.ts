export interface TodoItem {
  id: string
  description: string
  type: string
  done?: number | false
  position: number
  frequency?: string
}

export const CATEGORIES = [
  "🧹",
  "⚒️",
  "💰",
  "🪡",
  "🧶",
  "🖌️",
  "📓",
  "👾",
  "🖋️",
  "👩‍💻",
]
