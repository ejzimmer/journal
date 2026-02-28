import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { Book, Reading } from "./Reading"

import "./index.css"
import { BasicGoal, BasicGoalData } from "./BasicGoal"
import { Bikes, BikesGoal } from "./Bikes"
import { EmojiCheckbox } from "../../../shared/controls/EmojiCheckbox"
import { GameGoal, GameGoalData } from "./GameGoals"

type DiscreteTimesGoal = {
  id?: string
  description: string
  times: { id: string; total: number; completed?: number }[]
}

type Goal = Book | BasicGoalData | BikesGoal | DiscreteTimesGoal | GameGoalData

const path = "2026/other_goals"
const hasId = (book: Goal): book is Required<Goal> =>
  typeof book.id === "string"

export function OtherGoals() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing storage context")
  }

  const { value } = storageContext.useValue<Record<string, Goal>>(path)
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

const isDiscreteTimesGoal = (goal: Goal): goal is DiscreteTimesGoal =>
  "times" in goal
const isBikes = (goal: Goal): goal is BikesGoal =>
  "bikes" in goal && Array.isArray(goal.bikes)
const isGame = (goal: Goal): goal is GameGoalData =>
  "name" in goal && goal.name === "Wind Waker"

const getComponent = (goal: Goal, onUpdate: (goal: Goal) => void) => {
  if ("title" in goal) {
    return <Reading book={goal} onChange={onUpdate} />
  } else if (isDiscreteTimesGoal(goal)) {
    return (
      <div className="discrete-times-goal">
        <div className="description">{goal.description}</div>
        {goal.times.map((times, timesesIndex) => (
          <div className="completions" key={times.id}>
            {Array.from({ length: times.total }).map((_, index) => (
              <EmojiCheckbox
                key={index}
                label={times.id + index}
                emoji="✅"
                isChecked={!!(times.completed && index < times.completed)}
                onChange={() => {
                  const isChecked = index <= (times.completed ?? 0) ? -1 : 1
                  const completed = (times.completed ?? 0) + isChecked
                  onUpdate({
                    ...goal,
                    times: goal.times.with(timesesIndex, {
                      ...times,
                      completed,
                    }),
                  })
                }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  } else if (isBikes(goal)) {
    return <Bikes goal={goal} onChange={onUpdate} />
  } else if (isGame(goal)) {
    return <GameGoal goal={goal} onChange={onUpdate} />
  } else {
    return <BasicGoal goal={goal} onChange={onUpdate} />
  }
}
