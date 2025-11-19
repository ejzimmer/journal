import { subDays, isBefore, startOfDay, isAfter } from "date-fns"
import { isWeeklyTask, Task } from "./types"

export function dailyReset(tasks: Task[]): Task[] {
  return tasks
    .filter((task) => task.status !== "finished")
    .map((task) => {
      const today = Date.now()

      if (
        task.type === "毎日" &&
        task.status === "done" &&
        isBefore(task.lastUpdated, startOfDay(today))
      )
        return { ...task, status: "ready" }

      if (isWeeklyTask(task)) {
        const oneWeekAgo = subDays(today, 7)
        return {
          ...task,
          completed: task.completed?.filter(
            (date) => date && isAfter(date, oneWeekAgo)
          ),
        }
      }

      return task
    })
}
