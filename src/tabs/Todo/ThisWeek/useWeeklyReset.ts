import { useEffect } from "react"
import { endOfDay, isAfter, isBefore, startOfDay, subDays } from "date-fns"
import { useStorageContext } from "../../../shared/FirebaseContext"
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

export function useWeeklyReset() {
  const { useValue, updateItem, setValue } = useStorageContext()

  const { value: tasksById, loading: tasksLoading } =
    useValue<Record<string, WeeklyTask>>(WEEKLY_KEY)
  const { value: lastReset, loading: resetLoading } =
    useValue<number>(WEEKLY_RESET_KEY)

  useEffect(() => {
    if (tasksLoading || resetLoading) return
    if (lastReset !== undefined && !isBefore(lastReset, startOfDay(new Date())))
      return

    refreshTasks(Object.values(tasksById ?? {}), (task) =>
      updateItem<WeeklyTask>(WEEKLY_KEY, task),
    )

    setValue(WEEKLY_RESET_KEY, new Date().getTime())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksLoading, resetLoading, lastReset])
}
