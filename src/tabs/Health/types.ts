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
