import { useState } from "react"

import "./index.css"
import { Days } from "./Days"
import { WeeklyCalorieTracker } from "./WeeklyCalorieTracker"
import { Switch } from "../../shared/controls/Switch"

type View = "週" | "日"

export function Health() {
  const [view, setView] = useState<View>("週")

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
          className={`tracker-pane ${view === "週" ? "active" : ""}`}
          aria-hidden={view !== "週"}
          data-testid="weekly-pane"
        >
          <WeeklyCalorieTracker />
        </div>
        <div
          className={`tracker-pane ${view === "日" ? "active" : ""}`}
          aria-hidden={view !== "日"}
          data-testid="daily-pane"
        >
          <Days />
        </div>
      </div>
    </div>
  )
}
