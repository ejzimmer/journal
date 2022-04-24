import { DropResult } from "react-beautiful-dnd"
import { HabitRecord } from "../tabs/Track/types"
import { TodoItem } from "./TodoList/types"

export function isDailyTask(task: TodoItem) {
  return task.frequency && task.frequency.endsWith("日")
}

export function resortList<T>(
  { source, destination }: DropResult,
  items: any[],
  onReorder: (items: T[]) => void
) {
  // dropped outside the list
  if (!destination) {
    return
  }

  const movedItem = items[source.index]
  const listWithoutItem = items.filter((_, index) => index !== source.index)

  const listStart = listWithoutItem.slice(0, destination.index)
  const listEnd = listWithoutItem.slice(destination.index)

  onReorder(
    [...listStart, movedItem, ...listEnd].map((item, index) => ({
      ...item,
      position: index,
    }))
  )
}
