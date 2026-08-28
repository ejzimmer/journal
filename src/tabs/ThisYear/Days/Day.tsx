import { useState } from "react"
import { useStorageContext } from "../../../shared/FirebaseContext"
import { EmojiCheckbox } from "../../../shared/controls/EmojiCheckbox"
import { DayMonth } from "./types"
import { CalorieForm } from "./CalorieForm"
import { Trackers } from "./Trackers"
import { DayData, HABITS } from "../../../shared/types"

type DayProps = DayData & { date: DayMonth; path: string; balance?: number }

export function Day({ path, date, balance, ...props }: DayProps) {
  const [editingCalories, setEditingCalories] = useState(false)

  const { updateItem } = useStorageContext()

  const calorieFormIsVisible = editingCalories || typeof balance !== "number"

  return (
    <>
      <h2>
        {date.day} {date.month}
      </h2>
      {calorieFormIsVisible ? (
        <CalorieForm
          consumed={props.consumed}
          expended={props.expended}
          onSubmit={({ consumed, expended }) => {
            updateItem<DayData>(path, {
              ...props,
              consumed,
              expended,
            })

            setEditingCalories(false)
          }}
        />
      ) : (
        <>
          <div className="trackers">
            {HABITS.map((habit) => (
              <EmojiCheckbox
                key={habit}
                emoji={habit}
                isChecked={!!props.habits?.[habit]}
                label={habit}
                onChange={() => {
                  updateItem(path, {
                    ...props,
                    habits: {
                      ...props.habits,
                      [habit]: !props.habits?.[habit],
                    },
                  })
                }}
              />
            ))}
            <Trackers
              trackers={props.trackers}
              onUpdate={(trackers) => updateItem(path, { ...props, trackers })}
            />
          </div>
          <div className="balance" onClick={() => setEditingCalories(true)}>
            {balance}
          </div>
        </>
      )}
    </>
  )
}
