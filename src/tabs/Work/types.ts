export const COLOURS = [
  "blue",
  "yellow",
  "purple",
  "green",
  "orange",
  "red",
] as const

export type Colour = (typeof COLOURS)[number]

export type Label = {
  value: string
  colour: Colour
}

export const STATUS_KEYS = ["not_started", "done"] as const
export type StatusKey = (typeof STATUS_KEYS)[number]

export const WORKTREES = ["wt-1", "wt-2", "wt-3", "wt-4"] as const
export type Worktree = (typeof WORKTREES)[number]

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
  worktree?: Worktree
}

export const WORK_KEY = "work"
