export type TrackerBoolean = {
  label: string
  isChecked: boolean
  type: "boolean"
}

export type TrackerMultistate = {
  options: string[]
  value: string
  type: "multistate"
}

export type TrackerInput = {
  value: string
  type: "input"
}

export type Tracker = { id: string } & (
  | TrackerBoolean
  | TrackerMultistate
  | TrackerInput
)
export type Trackers = Record<string, Tracker>

export const initialiseDay = (): Trackers => ({
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
    options: ["⚫", "🟤", "🔴"],
    value: "⚫",
  },
  waist: { type: "input", id: "waist", value: "" },
})
