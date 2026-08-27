import { useState } from "react"

import "./index.css"
import { Days } from "./calories/Days"
import { WeeklyCalorieTracker } from "./calories/WeeklyCalorieTracker"
import { Switch } from "../../shared/controls/Switch"
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
    ],
  },
  {
    name: "Bulgarian split squat",
    updates: [{ date: new Date("2026-08-12"), update: "3 x 10 x 8kg" }],
  },
  {
    name: "B-stance RDL",
    updates: [{ date: new Date("2026-08-12"), update: "3 x 10 x 16kg" }],
  },
]

export function Health() {
  return (
    <div>
      <Calories />
    </div>
  )
}
