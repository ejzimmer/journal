import { useContext } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"

import "./index.css"
import { YarnTrackingForm } from "./YarnTracking/Form"
import { YarnDetails, KEY, yarnTypes } from "./YarnTracking/types"
import { YarnState } from "./YarnTracking/YarnState"
import { Combobox } from "../../shared/controls/combobox/Combobox"
import { StationRunning } from "./StationRunning/StationRunning"

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
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const { value } = storageContext.useValue<YarnDetails>(KEY)

  if (!value) {
    return <>Loading...</>
  }

  const total =
    (value &&
      yarnTypes
        .map((type) => value[type].history.at(-1)?.balance)
        .reduce((total = 0, amount = 0) => total + amount, 0)) ??
    1

  const yarnAmounts = Object.fromEntries(
    yarnTypes.map((yarn) => [yarn, value[yarn].history.at(-1)!.balance])
  )

  return (
    <div style={{ display: "grid", gap: "36px" }}>
      <div style={{ display: "flex", gap: "36px" }}>
        <YarnTrackingForm />
        <YarnState total={total} yarns={yarnAmounts} />
      </div>
      <StationRunning />
      <div className="day">
        <input />
        <input />
        <Combobox
          value={[]}
          label="tags"
          options={tags.map((tag) => ({ text: tag }))}
          createOption={(text) => ({ text })}
          allowMulti
          onChange={(value) => console.log(value)}
        />
      </div>
    </div>
  )
}
