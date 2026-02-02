import { EmojiCheckbox } from "../../../shared/controls/EmojiCheckbox"

type Bike = { name: string; icon: string; isDone: boolean }
export type BikesGoal = { id: string; bikes: Bike[] }

type BikesProps = {
  goal: BikesGoal
  onChange: (goal: BikesGoal) => void
}

export function Bikes({ goal, onChange }: BikesProps) {
  return (
    <ul className="bikes">
      {goal.bikes.map((bike, index) => (
        <li key={bike.name}>
          <EmojiCheckbox
            emoji={bike.icon}
            isChecked={bike.isDone}
            onChange={(event) =>
              onChange({
                ...goal,
                bikes: goal.bikes.with(index, {
                  ...bike,
                  isDone: event.target.checked,
                }),
              })
            }
            label={bike.name}
          />
          <div>{bike.name}</div>
        </li>
      ))}
    </ul>
  )
}
