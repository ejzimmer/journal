import { DayList } from "./Days/DayList"
import { OtherGoals } from "./OtherGoals"
import { StationRunning } from "./StationRunning/StationRunning"
import { YarnTracking } from "./YarnTracking"

export function ThisYear() {
  return (
    <div style={{ display: "grid", gap: "36px" }}>
      <YarnTracking />
      <StationRunning />
      <DayList />
      <OtherGoals />
    </div>
  )
}
