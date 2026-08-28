import { useEffect } from "react"
import { isBefore, startOfDay } from "date-fns"
import { useStorageContext } from "../../../shared/FirebaseContext"
import { DAILY_KEY, DAILY_RESET_KEY, DailyTask } from "../../../shared/types"

// Resets "done" everyday tasks back to "ready" once a day. Guarded by a
// single shared last-reset date, rather than each task's own lastCompleted
// timestamp, so the reset only runs (and writes) once per day rather than
// once per task per render.
export function useDailyReset(tasks: DailyTask[]) {
  const { useValue, updateItem, setValue } = useStorageContext()

  const { value: lastReset, loading } = useValue<number>(DAILY_RESET_KEY)

  useEffect(() => {
    if (loading) return
    if (lastReset !== undefined && !isBefore(lastReset, startOfDay(new Date())))
      return

    tasks
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
  }, [loading, lastReset])
}
