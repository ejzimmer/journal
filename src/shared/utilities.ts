import { TodoItem } from "./TodoList/types"

export function isDailyTask(task: TodoItem) {
  return task.frequency && task.frequency.endsWith("日")
}

interface DraggedItem {
  source: { index: number }
  destination?: { index: number }
}

export function resortList<T>(
  { source, destination }: DraggedItem,
  items: any[],
  onReorder: (items: T[]) => void
) {
  // dropped outside the list
  if (!destination) {
    return items
  }

  const movedItem = items[source.index]
  const listWithoutItem = items.filter((_, index) => index !== source.index)

  const listStart = listWithoutItem.slice(0, destination.index)
  const listEnd = listWithoutItem.slice(destination.index)

  const newList = [...listStart, movedItem, ...listEnd]
    .map((item, index) => ({
      ...item,
      position: index,
    }))
    .sort(sortItems)

  onReorder(newList)
}

const A_IS_FIRST = -1
const B_IS_FIRST = 1

export const sortItems = (a: TodoItem, b: TodoItem) => {
  if (a.done && b.done) return a.position - b.position
  if (a.done) return B_IS_FIRST
  if (b.done) return A_IS_FIRST

  const aIsEveryDay = a.frequency && a.frequency.endsWith("日")
  const bIsEveryDay = b.frequency && b.frequency.endsWith("日")
  if (aIsEveryDay === bIsEveryDay) return a.position - b.position
  if (aIsEveryDay) return A_IS_FIRST

  return B_IS_FIRST
}
