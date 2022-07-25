import { useState } from "react"
import { BooleanTracker } from "./BooleanTracker"

const TRACKERS = {
  stretch: { id: "stretch", label: "🧘🏽", isChecked: false },
  calories: { id: "calories", label: "⚖️", isChecked: false },
  teeth: { id: "teeth", label: "🦷", isChecked: false },
}

export function Health() {
  const [state, setState] = useState(TRACKERS)

  return (
    <>
      {Object.values(state).map((value) => (
        <BooleanTracker
          key={value.id}
          isChecked={value.isChecked}
          onChange={(isChecked) =>
            setState((state) => ({
              ...state,
              [value.id]: { ...value, isChecked },
            }))
          }
        >
          {value.label}
        </BooleanTracker>
      ))}
    </>
  )
}

/**
 * alcohol
 * waist
 * period
 */
