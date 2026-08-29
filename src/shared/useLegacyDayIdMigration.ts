import { useEffect } from "react"
import { useStorageContext } from "./FirebaseContext"
import { DAILY_PATH, DayData } from "./types"
import { normalizeDailyData, normalizeDayId } from "./utils"

// One-time migration of DayData still keyed with the pre-yyyy-mm-dd id
// format (e.g. "5Jan"). Delete this hook, its call site, and
// normalizeDayId/normalizeDailyData once production data is confirmed to
// be fully migrated.
export function useLegacyDayIdMigration() {
  const { useValue, updateItem, deleteItem } = useStorageContext()
  const { value, loading } = useValue<Record<string, DayData>>(DAILY_PATH)

  useEffect(() => {
    if (loading || !value) {
      return
    }

    const normalized = normalizeDailyData(value)

    Object.keys(value).forEach((key) => {
      const id = normalizeDayId(key)
      if (id === key) {
        return
      }

      updateItem<DayData>(DAILY_PATH, normalized[id])
      deleteItem<DayData>(DAILY_PATH, { id: key } as DayData)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, value])
}
