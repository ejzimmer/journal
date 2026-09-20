import { endOfDay, isAfter, subDays } from "date-fns"
import { useStorageContext } from "../../../shared/FirebaseContext"
import { useDailyJob } from "../../../shared/dailyJobs/DailyJobsContext"
import { WEEKLY_KEY, WEEKLY_RESET_KEY, WeeklyTask } from "../../../shared/types"

export function refreshTasks(
  tasks: WeeklyTask[],
  updateTask: (task: WeeklyTask) => void,
) {
  tasks.forEach((task) => {
    if (!task.completed) return

    const completed: (number | null)[] = Array.isArray(task.completed)
      ? task.completed
      : Object.values(task.completed)

    const updatedCompleted = completed.filter((date) => {
      return date && isAfter(date, endOfDay(subDays(new Date(), 7)))
    })
    if (updatedCompleted.length !== task.completed.length) {
      updateTask({ ...task, completed: updatedCompleted })
    }
  })
}

export function useWeeklyTaskUpdate() {
  const { useValue, updateItem } = useStorageContext()
  const { value: tasksById } = useValue<Record<string, WeeklyTask>>(WEEKLY_KEY)

  useDailyJob({
    lastRunKey: WEEKLY_RESET_KEY,
    isReady: tasksById !== undefined,
    run: () =>
      refreshTasks(Object.values(tasksById ?? {}), (task) =>
        updateItem<WeeklyTask>(WEEKLY_KEY, task),
      ),
  })
}
