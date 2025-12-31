import { useContext } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"

import "./index.css"
import { YarnTrackingForm } from "./YarnTracking/Form"
import { YarnDetails, KEY, yarnTypes } from "./YarnTracking/types"
import { YarnState } from "./YarnTracking/YarnState"

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
    <div style={{ display: "flex", gap: "36px" }}>
      <YarnTrackingForm />
      <YarnState total={total} yarns={yarnAmounts} />
    </div>
  )
}
