export type ProjectDetails = {
  id: string
  description: string
  type: string
  position?: number
  lastUpdated?: number
  status?: "ready" | "in_progress" | "done"
}

export const COLOURS = {
  "🛒": "hsla(197 36% 70% /.3)",
  "📓": "hsl(0  0% 49% / .3)",
  "🖊️": "hsl(209 79% 48% /.3)",
  "👩‍💻": "hsl(93 90% 45% / .3)",
  "🧹": "hsl(45 100% 76% / .3)",
  "🪡": "hsl(203 85% 77% / .3)",
  "🧶": "hsl(339 78% 67% / .3)",
  "🚚": "hsla(352 90% 45% / .3)",
}

export const KEY = "projects"
