import { OrderedListItem } from "../../shared/drag-and-drop/types"

export type Category = {
  text: string
  emoji: string
}

export type Task = OrderedListItem & {
  description: string
  category: Category
}

export const ROOT_LIST = "today"
