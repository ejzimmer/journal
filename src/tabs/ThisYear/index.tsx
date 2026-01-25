import { Days } from "./Days/Days"
import { StationRunning } from "./StationRunning/StationRunning"
import { YarnTracking } from "./YarnTracking"

export function ThisYear() {
  return (
    <div style={{ display: "grid", gap: "36px" }}>
      <YarnTracking />
      <StationRunning />
      <Days />
    </div>
  )
}
