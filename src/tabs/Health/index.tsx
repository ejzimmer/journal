import { useState } from "react"
import { BooleanTracker } from "./BooleanTracker"
import { InputTracker } from "./InputTracker"
import { MultistateTracker } from "./MultistateTracker"

type TrackerBoolean = {
  label: string
  isChecked: boolean
  type: "boolean"
}

type TrackerMultistate = {
  options: string[]
  value: string
  type: "multistate"
}

type TrackerInput = {
  value: string
  type: "input"
}

type Tracker = { id: string } & (
  | TrackerBoolean
  | TrackerMultistate
  | TrackerInput
)
type Trackers = Record<string, Tracker>

const TRACKERS: Trackers = {
  stretch: { type: "boolean", id: "stretch", label: "🧘🏽", isChecked: false },
  calories: { type: "boolean", id: "calories", label: "⚖️", isChecked: false },
  teeth: { type: "boolean", id: "teeth", label: "🦷", isChecked: false },
  drinks: {
    type: "multistate",
    id: "drinks",
    options: ["🫖", "🍺", "🍻"],
    value: "🫖",
  },
  period: {
    type: "multistate",
    id: "period",
    options: ["⚪", "🐞", "🔴"],
    value: "⚪",
  },
  waist: { type: "input", id: "waist", value: "86" },
}

export function Health() {
  const [state, setState] = useState(TRACKERS)

  const updateTracker = (tracker: Tracker, key: string, value: any) => {
    setState((state) => ({
      ...state,
      [tracker.id]: {
        ...tracker,
        [key]: value,
      },
    }))
  }

  return (
    <>
      {Object.values(state).map((tracker) => {
        switch (tracker.type) {
          case "boolean":
            return (
              <BooleanTracker
                key={tracker.id}
                isChecked={tracker.isChecked}
                onChange={(isChecked) =>
                  updateTracker(tracker, "isChecked", isChecked)
                }
              >
                {tracker.label}
              </BooleanTracker>
            )
          case "multistate":
            return (
              <MultistateTracker
                key={tracker.id}
                name={tracker.id}
                options={tracker.options}
                value={tracker.value}
                onChange={(value) => updateTracker(tracker, "value", value)}
              />
            )
          case "input":
            return (
              <InputTracker
                key={tracker.id}
                value={tracker.value}
                onChange={(value) => updateTracker(tracker, "value", value)}
              />
            )
        }
      })}
    </>
  )
}
