import { NewTask } from "./AddTaskForm"

export type Category = {
  text: string
  emoji: string
}

export type TaskType = "日付" | "週に" | "毎日" | "一度"

export type Task = {
  id: string
  description: string
  category: Category
  lastUpdated: number
  type: TaskType
  status: "blocked" | "ready" | "in_progress" | "done" | "finished"
}

export type DailyTask = Task & { type: "毎日" | "一度" }
export type WeeklyTask = Task & {
  type: "週に"
  frequency: number
  completed?: (number | undefined)[]
}
export type CalendarTask = Task & { type: "日付"; dueDate: number }

export const isWeeklyTask = (task: Task): task is WeeklyTask =>
  task.type === "週に"
export const isCalendarTask = (task: Task): task is CalendarTask =>
  task.type === "日付"

export type TaskListProps<T extends Task> = {
  tasks?: T[]
  onChangeTask: (task: T) => void
  onDeleteTask: (task: T) => void
  onCreateTask: (task: NewTask) => void
  categories: Category[]
}
