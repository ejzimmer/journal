import { useEffect } from "react"
import { isBefore, startOfDay } from "date-fns"
import { useStorageContext } from "../../../shared/FirebaseContext"
import { DAILY_KEY, DAILY_RESET_KEY, DailyTask } from "../../../shared/types"

export function useDailyReset() {
  const { useValue, updateItem, setValue } = useStorageContext()

  const { value: tasksById, loading: tasksLoading } =
    useValue<Record<string, DailyTask>>(DAILY_KEY)
  const { value: lastReset, loading: resetLoading } =
    useValue<number>(DAILY_RESET_KEY)

  useEffect(() => {
    if (tasksLoading || resetLoading) return
    if (lastReset !== undefined && !isBefore(lastReset, startOfDay(new Date())))
      return

    Object.values(tasksById ?? {})
      .filter((task) => task.status === "done")
      .forEach((task) =>
        updateItem<DailyTask>(DAILY_KEY, {
          ...task,
          status: "ready",
          lastCompleted: new Date().getTime(),
        }),
      )

    setValue(DAILY_RESET_KEY, new Date().getTime())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksLoading, resetLoading, lastReset])
}
