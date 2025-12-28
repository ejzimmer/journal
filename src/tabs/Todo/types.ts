export type Category = {
  text: string
  emoji: string
}

export type Task = {
  id: string
  description: string
  category: Category
}

export type Daily = {
  type: "毎日" | "一度"
  status: "ready" | "done" | "finished"
  lastCompleted: number
}
export type Weekly = {
  frequency: number
  completed: (number | undefined)[]
}
export type Calendar = { dueDate: number; status: "ready" | "finished" }

export type TaskListProps<T extends Daily | Weekly | Calendar> = {
  tasks: (T & Task)[]
  createTask: (task: T & Omit<Task, "id">) => T & Task
  onUpdateList: (list: (T & Task)[]) => void
  categories: Category[]
}

export type TaskProps<T extends Daily | Weekly | Calendar> = {
  task: Task & T
  onChange: (task: Task & T) => void
  onDelete: () => void
}
