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

export type StoredLabel = Label & {
  id: string
  lastRemoved?: number
}

export const LABELS_KEY = "work-labels"

export const STATUS_KEYS = ["not_started", "done"] as const
export type StatusKey = (typeof STATUS_KEYS)[number]

export const WORKTREES = ["wt1", "wt2", "wt3", "wt4"] as const
export type Worktree = (typeof WORKTREES)[number]

export type Subtask = {
  id: string
  description: string
}

export type WorkTask = {
  id: string
  description: string
  status: StatusKey
  parentId: string
  items?: Record<string, WorkTask>
  lastStatusUpdate: number
  dueDate?: number
  position: number
  labelIds?: string[]
  worktree?: Worktree
  subtasks?: Record<string, Subtask>
}

export const WORK_KEY = "work"

export const STANDARD_CHECKLIST = [
  "test",
  "review",
  "PR",
  "QA",
  "build",
  "mark PR ready",
  "approvals",
]
