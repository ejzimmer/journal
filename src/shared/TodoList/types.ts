export interface TodoItem {
  id: string
  description: string
  type: Category
  done?: number | false
  position: number
  frequency?: string
}

export const COLOURS = {
  "🧹": "hsl(180 20% 90%)",
  "⚒️": "hsl(340 90% 90%)",
  "🚴‍♀️": "hsl(120 70% 85%)",
  "💰": "hsl(100 50% 85%)",
  "🪡": "hsl(250 50% 90%)",
  "🧶": "hsl(80 50% 90%)",
  "🖌️": "hsl(30 50% 90%)",
  "📓": "hsl(60 50% 90%)",
  "👾": "hsl(300 50% 90%)",
  "🖋️": "hsl(50 50% 90%)",
  "👩‍💻": "hsl(160 50% 90%)",
  "👥": "hsl(355 90% 92%)",
}
export type Category = keyof typeof COLOURS

export const isCategory = (label?: string): label is Category =>
  !!(label && label in COLOURS)
