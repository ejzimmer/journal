import { isBeforeToday, isToday } from "../../../shared/dates"
import { useStorageContext } from "../../../shared/FirebaseContext"
import { useDailyJob } from "../../../shared/dailyJobs/DailyJobsContext"
import {
  CALENDAR_KEY,
  CALENDAR_RESET_KEY,
  CalendarTask,
} from "../../../shared/types"

const readyToDelete = (task: CalendarTask) =>
  task.status === "finished" &&
  isBeforeToday(task.dueDate) &&
  isBeforeToday(task.statusUpdateDate)

const taskIsToday = (task: CalendarTask) => isToday(task.dueDate)

export function useDueDateReset() {
  const { useValue, deleteItem, updateItem } = useStorageContext()
  const { value: tasksById } = useValue<Record<string, CalendarTask>>(
    CALENDAR_KEY,
  )

  useDailyJob({
    lastRunKey: CALENDAR_RESET_KEY,
    isReady: tasksById !== undefined,
    run: () => {
      const tasks = Object.values(tasksById ?? {})

      tasks
        .filter(readyToDelete)
        .forEach((task) => deleteItem<CalendarTask>(CALENDAR_KEY, task))

      tasks
        .filter((task) => taskIsToday(task) && task.status === "paused")
        .forEach((task) =>
          updateItem(CALENDAR_KEY, { ...task, status: "ready" }),
        )
    },
  })
}
