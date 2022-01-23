import { TodoItem } from "./TodoList/types"

export function isDailyTask(task: TodoItem) {
  return task.frequency && task.frequency.endsWith("日")
}
