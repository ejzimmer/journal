import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { Book, Reading } from "./Reading"

import "./index.css"
import { BasicGoal, BasicGoalData } from "./BasicGoal"
import { Bikes, BikesGoal } from "./Bikes"

type Goal = Book | BasicGoalData | BikesGoal

const path = "2026/other_goals"
const hasId = (book: Goal): book is Required<Goal> =>
  typeof book.id === "string"

export function OtherGoals() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing storage context")
  }

  const { value } = storageContext.useValue<Goal>(path)
  const goals = value ? Object.values(value) : []

  const onUpdate = (goal: Goal) => {
    if (hasId(goal)) {
      storageContext.updateItem(path, goal)
    } else {
      storageContext.addItem<Goal>(path, goal)
    }
  }

  return (
    <ul className="other-goals">
      {goals.map((goal) => (
        <li key={goal.id}>{getComponent(goal, onUpdate)}</li>
      ))}
    </ul>
  )
}

const isBikes = (goal: Goal): goal is BikesGoal =>
  "bikes" in goal && Array.isArray(goal.bikes)

const getComponent = (goal: Goal, onUpdate: (goal: Goal) => void) => {
  if ("title" in goal) {
    return <Reading book={goal} onChange={onUpdate} />
  } else if (isBikes(goal)) {
    return <Bikes goal={goal} onChange={onUpdate} />
  } else {
    return <BasicGoal goal={goal} onChange={onUpdate} />
  }
}
