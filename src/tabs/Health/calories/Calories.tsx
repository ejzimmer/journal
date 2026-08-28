import { useContext, useMemo, useState } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { DayData, DAILY_PATH } from "../../../shared/types"
import { setupDays } from "../utils"
import { Switch } from "../../../shared/controls/Switch"
import { Days } from "./Days"
import { WeeklyCalorieTracker } from "./WeeklyCalorieTracker"
import "./Calories.css"

type View = "週" | "日"

export function Calories() {
  const [view, setView] = useState<View>("週")

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("no storage context")
  }
  const { value } = storageContext.useValue<Record<string, DayData>>(DAILY_PATH)

  const days = useMemo(() => setupDays(value), [value])

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
      </div>
    </div>
  )
}
