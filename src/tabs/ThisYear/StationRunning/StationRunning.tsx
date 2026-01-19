import "./StationRunning.css"

const stations = [
  { name: "Southern Cross", distance: 30 },
  { name: "Flinders St", distance: 25.5 },
  { name: "Jolimont", distance: 24 },
  { name: "West Richmond", distance: 23 },
  { name: "North Richmond", distance: 22.5 },
  { name: "Collingwood", distance: 22 },
  { name: "Victoria Park", distance: 20.5 },
  { name: "Clifton Hill", distance: 19.5 },
  { name: "Westgarth", distance: 19.5 },
  { name: "Dennis", distance: 19 },
  { name: "Fairfield", distance: 14.5 },
  { name: "Alphington", distance: 13.5 },
  { name: "Darebin", distance: 13.5 },
  { name: "Ivanhoe", distance: 13.5 },
  { name: "Eaglemont", distance: 13 },
  { name: "Heidelberg", distance: 8 },
  { name: "Rosanna", distance: 4.5 },
  { name: "Mcleod", distance: 3 },
  { name: "Watsonia", distance: 0 },
  { name: "Greensborough", distance: 4 },
  { name: "Montmorency", distance: 6 },
  { name: "Eltham", distance: 14 },
  { name: "Diamond Creek", distance: 15 },
  { name: "Wattle Glen", distance: 16.5 },
  { name: "Hurstbridge", distance: 20 },
]

export function StationRunning() {
  return (
    <ol className="trainline">
      {stations.map(({ name, distance }) => (
        <li key={name}>
          <Station name={name} distance={distance} />
        </li>
      ))}
    </ol>
  )
}

function Station({ name, distance }: { name: string; distance: number }) {
  return (
    <div className="station">
      <div className="name">{name}</div>
    </div>
  )
}
