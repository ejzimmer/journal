import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import "./StationRunning.css"

const KEY = "2026/stations"

type StationDetails = {
  id: string
  name: string
  distance: number
  isDone: boolean
}

export function StationRunning() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing storage context")
  }

  const { value } = storageContext.useValue<StationDetails>(KEY)
  const stations = value && Object.values(value)

  return (
    <ol className="trainline">
      {stations?.map((station) => (
        <li
          key={station.name}
          className={station.name === "Watsonia" ? "home" : ""}
        >
          <Station
            {...station}
            onChange={(station) => storageContext.updateItem(KEY, station)}
          />
        </li>
      ))}
    </ol>
  )
}

function Station({
  onChange,
  ...station
}: StationDetails & { onChange: (station: StationDetails) => void }) {
  return (
    <label className={`station ${station.isDone ? "done" : ""}`}>
      <div className="name">
        <b>{station.name}</b>{" "}
        <span className="distance">{station.distance}km</span>
        <input
          type="checkbox"
          checked={station.isDone}
          onChange={() => onChange({ ...station, isDone: !station.isDone })}
        />
      </div>
    </label>
  )
}
