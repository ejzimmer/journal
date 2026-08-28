import { useEffect, useMemo, useRef, useState } from "react"
import { PlusIcon } from "../../shared/icons/Plus"
import { formatDate } from "../../shared/utils"
import "./ExerciseTracker.css"

type Update = {
  date: Date
  update: string
  recommendation?: "up" | "stay" | "down"
}

type Exercise = {
  name: string
  updates: Update[]
}

type ExerciseTrackerProps = {
  exercises: Exercise[]
}

export function ExerciseTracker({ exercises }: ExerciseTrackerProps) {
  const numberOfColumns = exercises.reduce(
    (highest, exercise) => Math.max(highest, exercise.updates.length),
    0,
  )

  return (
    <table className="exercise-tracker">
      <tbody>
        {exercises.map((exercise) => (
          <ExerciseRow
            key={exercise.name}
            exercise={exercise}
            maxColumns={numberOfColumns}
          />
        ))}
      </tbody>
    </table>
  )
}

type ExerciseRowProps = {
  exercise: Exercise
  maxColumns: number
}

function ExerciseRow({ exercise, maxColumns }: ExerciseRowProps) {
  const [showForm, setShowForm] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const emptyCells = useMemo(
    () =>
      Array.from({
        length: maxColumns - exercise.updates.length,
      }),
    [maxColumns, exercise],
  )

  useEffect(() => {
    dateInputRef.current?.focus()
  }, [showForm])

  return (
    <tr>
      <th role="rowheader">{exercise.name}</th>
      {exercise.updates.map(({ date, update }) => {
        const { day, month, year } = formatDate(date)
        return (
          <td key={date.toString()}>
            <div className="date">
              {day} {month} {year}
            </div>
            {update}
          </td>
        )
      })}
      {emptyCells.length > 0 && (
        <td>
          {showForm && (
            <form aria-label={`Record ${exercise.name}`}>
              <input ref={dateInputRef} type="date" aria-label="Date" />
              <textarea aria-label="Update" />
            </form>
          )}
        </td>
      )}
      {emptyCells.length > 1 &&
        emptyCells.slice(1).map((_, index) => <td key={`${index}`} />)}
      <td>
        <button
          className="secondary-clear"
          style={{ color: "var(--action-colour)" }}
          aria-label={`Record ${exercise.name}`}
          onClick={() => setShowForm(true)}
        >
          <PlusIcon width="24px" />
        </button>
      </td>
    </tr>
  )
}
