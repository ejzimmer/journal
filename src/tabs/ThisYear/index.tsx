import { Combobox } from "../../shared/controls/combobox/Combobox"
import { StationRunning } from "./StationRunning/StationRunning"
import { YarnTracking } from "./YarnTracking"

const tags = [
  "💪",
  "🏃‍♀️",
  "🛼",
  "🍺",
  "🍻",
  "✈️",
  "🤒",
  "🟤",
  "🩸",
  "🇯🇵",
  "📕",
  "🇫🇷",
  "🈲",
  "🚫",
  "🥡",
  "✏️",
]

export function ThisYear() {
  return (
    <div style={{ display: "grid", gap: "36px" }}>
      <YarnTracking />
      <StationRunning />
      <div className="day">
        <input />
        <input />
        <Combobox
          value={[]}
          label="tags"
          options={tags.map((tag) => ({ id: tag, label: tag }))}
          createOption={(text) => ({ label: text, id: text })}
          isMultiValue
          onChange={(value) => console.log(value)}
        />
      </div>
    </div>
  )
}
