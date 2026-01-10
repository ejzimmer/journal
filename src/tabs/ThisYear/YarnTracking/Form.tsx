import { useContext, useRef, useState } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { KEY, YarnDetails, yarnTypes } from "./types"
import { Switch } from "../../../shared/controls/Switch"

import "./Form.css"
import { TickIcon } from "../../../shared/icons/Tick"

export function YarnTrackingForm() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value } = storageContext.useValue<YarnDetails>(KEY)

  const yarnTypeRef = useRef<HTMLSelectElement>(null)
  const amountRef = useRef<HTMLInputElement>(null)
  const [operation, setOperation] = useState<"+" | "-">("-")

  const updateYarn = (event: React.FormEvent) => {
    event.preventDefault()

    if (!value) {
      return
    }

    const yarnType = yarnTypeRef.current?.value
    const amount =
      amountRef.current?.value && Number.parseFloat(amountRef.current.value)

    if (!yarnType || !operation || !amount) {
      return
    }

    const yarnDetails = value[yarnType]
    const currentBalance = yarnDetails.history.at(-1)?.balance ?? 0

    // eslint-disable-next-line no-eval
    const newBalance = eval(`${currentBalance}${operation}${amount}`)

    storageContext.updateItem<YarnDetails>(KEY, {
      id: yarnType,
      history: [
        ...yarnDetails.history,
        { balance: newBalance, date: new Date().getTime() },
      ],
    })
    ;(event.target as HTMLFormElement).reset()
  }

  return (
    <form onSubmit={updateYarn} className="yarn-tracking-form">
      <select ref={yarnTypeRef}>
        {yarnTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <Switch
        options={["-", "+"]}
        value={operation}
        onChange={setOperation}
        name="yarn-tracking"
      />
      <input pattern="[0-9, ]+" size={5} ref={amountRef} />
      <button className="outline" type="submit">
        <TickIcon width="18px" colour="var(--success-colour)" />
      </button>
    </form>
  )
}
