import { useEffect } from "react"
import { useStorageContext } from "./FirebaseContext"
import { DAILY_PATH, DayData } from "./types"
import { normaliseDailyData, normaliseDayId } from "./utils"

// One-time migration of DayData still keyed with the pre-yyyy-mm-dd id
// format (e.g. "5Jan"). Delete this hook, its call site, and
// normaliseDayId/normaliseDailyData once production data is confirmed to
// be fully migrated.
export function useLegacyDayIdMigration() {
  const { useValue, updateItem, deleteItem } = useStorageContext()
  const { value, loading } = useValue<Record<string, DayData>>(DAILY_PATH)

  useEffect(() => {
    if (loading || !value) {
      return
    }

    const normalised = normaliseDailyData(value)

    Object.keys(value).forEach((key) => {
      const id = normaliseDayId(key)
      if (id === key) {
        return
      }

      updateItem<DayData>(DAILY_PATH, normalised[id])
      deleteItem<DayData>(DAILY_PATH, { id: key } as DayData)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, value])
}
