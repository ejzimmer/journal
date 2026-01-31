import { Days } from "./Days/Days"
import { OtherGoals } from "./OtherGoals"
import { StationRunning } from "./StationRunning/StationRunning"
import { YarnTracking } from "./YarnTracking"

export function ThisYear() {
  return (
    <div style={{ display: "grid", gap: "36px" }}>
      <YarnTracking />
      <StationRunning />
      <Days />
      <OtherGoals />
    </div>
  )
}
