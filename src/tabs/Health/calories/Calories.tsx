import { useMemo, useState } from "react"
import { useStorageContext } from "../../../shared/FirebaseContext"
import { DayData, DAILY_PATH } from "../../../shared/types"
import { setupDays } from "../utils"
import { Switch } from "../../../shared/controls/Switch"
import { Days } from "./Days"
import { WeeklyCalorieTracker } from "./WeeklyCalorieTracker"
import { CalorieForm } from "./CalorieForm"
import "./Calories.css"

type View = "週" | "日"

export function Calories() {
  const [view, setView] = useState<View>("週")
  const [dismissed, setDismissed] = useState(false)

  const { useValue, updateItem } = useStorageContext()
  const { value } = useValue<Record<string, DayData>>(DAILY_PATH)

  const days = useMemo(() => setupDays(value), [value])
  const yesterday = days[days.length - 1]
  const yesterdayId = yesterday && `${yesterday.day}${yesterday.month}`
  const yesterdayData = yesterdayId ? value?.[yesterdayId] : undefined
  const caloriesRecordedYesterday = typeof yesterday?.diff === "number"

  return (
    <div>
      <div className="tracker-switch">
        <Switch
          options={["週", "日"]}
          value={view}
          onChange={setView}
          name="tracker-view"
        />
      </div>
      <div className="tracker-stage">
        <div
          className={`tracker-pane ${view === "日" ? "active" : ""}`}
          aria-hidden={view !== "日"}
        >
          <Days days={days} />
        </div>
        <div
          className={`tracker-pane ${view === "週" ? "active" : ""}`}
          aria-hidden={view !== "週"}
        >
          <WeeklyCalorieTracker days={days} />
        </div>
        {yesterday && yesterdayId && !caloriesRecordedYesterday && !dismissed && (
          <CalorieForm
            date={{ day: yesterday.day, month: yesterday.month }}
            consumed={yesterdayData?.consumed}
            expended={yesterdayData?.expended}
            onClose={() => setDismissed(true)}
            onSubmit={({ consumed, expended }) => {
              updateItem<DayData>(DAILY_PATH, {
                ...(yesterdayData ?? { id: yesterdayId }),
                id: yesterdayId,
                consumed,
                expended,
              })
            }}
          />
        )}
      </div>
    </div>
  )
}
