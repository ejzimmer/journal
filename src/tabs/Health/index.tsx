import { useState } from "react"
import { BooleanTracker } from "./BooleanTracker"
import { MultistateTracker } from "./MutlistateTracker"

type TrackerBoolean = {
  id: string
  label: string
  isChecked: boolean
}

type TrackerMultistate = {
  id: string
  options: string[]
  value: string
}

type Tracker = TrackerBoolean | TrackerMultistate
type Trackers = Record<string, Tracker>

const TRACKERS: Trackers = {
  stretch: { id: "stretch", label: "🧘🏽", isChecked: false },
  calories: { id: "calories", label: "⚖️", isChecked: false },
  teeth: { id: "teeth", label: "🦷", isChecked: false },
  drinks: { id: "drinks", options: ["🫖", "🍺", "🍻"], value: "🫖" },
  period: { id: "period", options: ["⚪", "🐞", "🔴"], value: "⚪" },
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
        if (isMultistate(tracker)) {
          return (
            <MultistateTracker
              key={tracker.id}
              name={tracker.id}
              options={tracker.options}
              value={tracker.value}
              onChange={(value) => updateTracker(tracker, "value", value)}
            />
          )
        }

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
      })}
    </>
  )
}

function isMultistate(tracker: Tracker): tracker is TrackerMultistate {
  return (tracker as TrackerMultistate).options !== undefined
}

/**
 * waist
 */
