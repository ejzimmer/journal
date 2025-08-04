import {
  startOfISOWeek,
  endOfISOWeek,
  eachDayOfInterval,
  isWeekend,
} from "date-fns"
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

const sortByPositionInCategory = (
  a: TodoItem,
  b: TodoItem,
  inCategory: (a: TodoItem) => boolean = () => true
) => {
  if (inCategory(a) && inCategory(b)) return a.position - b.position
  if (inCategory(a)) return A_IS_FIRST
  if (inCategory(b)) return B_IS_FIRST

  return 0
}

export const sortItems = (a: TodoItem, b: TodoItem) => {
  return (
    sortByPositionInCategory(a, b, (item) => !!item.done) * -1 ||
    sortByPositionInCategory(
      a,
      b,
      (item) => !!(item.frequency && item.frequency.endsWith("日"))
    ) ||
    sortByPositionInCategory(a, b, (item) => item.type === "⚒️") ||
    sortByPositionInCategory(a, b, (item) => item.type === "🚴‍♀️") ||
    sortByPositionInCategory(a, b)
  )
}

export const getWeekdays = (date: Date) => {
  const startDate = startOfISOWeek(date)
  const endOfWeek = endOfISOWeek(startDate)
  return eachDayOfInterval({ start: startDate, end: endOfWeek })
}

export const isWorkDay = (date: Date) =>
  !(isWeekend(date) || date.getDay() === 1)
