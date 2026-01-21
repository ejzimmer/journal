import { YarnTrackingForm } from "./Form"
import { YarnState } from "./YarnState"

export function YarnTracking() {
  return (
    <div style={{ display: "flex", gap: "36px" }}>
      <YarnState />
      <YarnTrackingForm />
    </div>
  )
}
