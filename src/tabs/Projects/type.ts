export const COLOURS = {
  "🛒": "hsl(197 36% 70% /.3)",
  "📓": "hsl(0  0% 49% / .3)",
  "🖊️": "hsl(209 79% 48% /.3)",
  "👩‍💻": "hsl(93 90% 45% / .3)",
  "🧹": "hsl(45 100% 76% / .3)",
  "🪡": "hsl(203 85% 77% / .3)",
  "🧶": "hsl(339 78% 67% / .3)",
  "🚚": "hsl(352 90% 45% / .3)",
}

export type Category = keyof typeof COLOURS

export const categories = Object.keys(COLOURS)

export type ProjectDetails = {
  id: string
  description: string
  category: Category
  position?: number
  lastUpdated?: number
  status?: "ready" | "in_progress" | "done"
}

export const KEY = "projects"
