import { subDays, isBefore, startOfDay, isAfter } from "date-fns"
import { isWeeklyTask, Task } from "./types"

export function dailyReset(tasks: Task[]): Task[] {
  console.log("running daily reset", new Date())
  return tasks
    .filter((task) => task.status !== "finished")
    .map((task) => {
      const today = Date.now()

      if (
        task.type === "毎日" &&
        task.status === "done" &&
        isBefore(task.lastUpdated, startOfDay(today))
      ) {
        console.log("resetting daily task", task)
        return { ...task, status: "ready" }
      }

      if (isWeeklyTask(task)) {
        const oneWeekAgo = subDays(today, 7)
        console.log("one week ago", oneWeekAgo)
        console.log("task before", task)
        console.log("task after", {
          ...task,
          completed: task.completed?.filter(
            (date) => date && isAfter(date, oneWeekAgo)
          ),
        })
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
