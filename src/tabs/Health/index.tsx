import { useState } from "react"

import "./index.css"
import { DailyBreakdown } from "./DailyBreakdown"
import { WeeklyCalorieTracker } from "./WeeklyCalorieTracker"
import { Switch } from "../../shared/controls/Switch"

type View = "週" | "日"

export function Health() {
  const [view, setView] = useState<View>("週")

  return (
    <div>
      <Switch
        options={["週", "日"]}
        value={view}
        onChange={setView}
        name="tracker-view"
      />
      <div className="tracker-stage">
        <div
          className={`tracker-pane ${view === "週" ? "active" : ""}`}
          aria-hidden={view !== "週"}
        >
          <WeeklyCalorieTracker />
        </div>
        <div
          className={`tracker-pane ${view === "日" ? "active" : ""}`}
          aria-hidden={view !== "日"}
        >
          <DailyBreakdown />
        </div>
      </div>
    </div>
  )
}
