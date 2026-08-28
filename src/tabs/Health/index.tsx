import "./index.css"
import { ExerciseTracker } from "./ExerciseTracker"
import { Calories } from "./calories/Calories"

const exercises = [
  {
    name: "Box pistol squat",
    updates: [
      {
        date: new Date("2026-08-12"),
        update:
          "2 x 5 x 3 mats + 1 low yoga block + 1 high yoga block, 1 x 5 3 mats + 2 low yoga blocks (eccentric only)",
      },
      {
        date: new Date("2026-08-16"),
        update:
          "2 x 5 x 3 mats + 1 low yoga block + 1 high yoga block, 1 x 5 3 mats + 2 low yoga blocks (eccentric only)",
      },
    ],
  },
  {
    name: "Bulgarian split squat",
    updates: [
      {
        date: new Date("2026-08-12"),
        update: "3 x 10 x 8kg",
        recommendation: "stay" as const,
      },
    ],
  },
  {
    name: "B-stance RDL",
    updates: [
      {
        date: new Date("2026-08-12"),
        update: "3 x 10 x 16kg",
        recommendation: "up" as const,
      },
      { date: new Date("2026-08-15"), update: "3 x 10 x 20kg" },
      { date: new Date("2026-08-17"), update: "3 x 10 x 20kg" },
    ],
  },
]

export function Health() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Calories />
      <ExerciseTracker exercises={exercises} />
    </div>
  )
}
