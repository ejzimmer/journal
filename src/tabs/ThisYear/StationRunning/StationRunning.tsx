import { useStorageContext } from "../../../shared/FirebaseContext"
import "./StationRunning.css"

const KEY = "2026/stations"

type StationDetails = {
  id: string
  name: string
  distance: number
  isDone: boolean
}

export function StationRunning() {
  const { useValue, updateItem } = useStorageContext()

  const { value } = useValue<Record<string, StationDetails>>(KEY)
  const stations = value && Object.values(value)

  return (
    <div
      style={{
        maxWidth: "100%",
        overflow: "auto",
        paddingBlockEnd: "4px",
        marginInline: "auto",
        paddingInlineEnd: "120px",
      }}
    >
      <ol className="trainline">
        {stations?.map((station) => (
          <li
            key={station.name}
            className={station.name === "Watsonia" ? "home" : ""}
          >
            <Station
              {...station}
              onChange={(station) => updateItem(KEY, station)}
            />
          </li>
        ))}
      </ol>
    </div>
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
