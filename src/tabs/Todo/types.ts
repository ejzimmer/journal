export type Category = {
  text: string
  emoji: string
}

export type Task = {
  id: string
  description: string
  category: Category
}

export const ROOT_LIST = "today"
