import { JSX, useEffect, useMemo, useRef, useState } from "react"
import { PlusIcon } from "../../shared/icons/Plus"
import { formatDate } from "../../shared/utils"
import "./ExerciseTracker.css"
import { useStorageContext } from "../../shared/FirebaseContext"
import { ChevronUpIcon } from "../../shared/icons/ChevronUp"
import { IconProps } from "../../shared/icons/types"
import { ChevronDownIcon } from "../../shared/icons/ChevronDown"
import { EqualIcon } from "../../shared/icons/Equal"

type Recommendation = "increase" | "no change" | "decrease"

type Update = {
  date: Date
  update: string
  recommendation?: Recommendation
}

export type Exercise = {
  id: string
  name: string
  updates: Update[]
}

type ExerciseTrackerProps = {
  exercises: Exercise[]
}

export function ExerciseTracker({ exercises }: ExerciseTrackerProps) {
  const numberOfColumns =
    exercises.reduce(
      (highest, exercise) => Math.max(highest, exercise.updates.length),
      0,
    ) + 1

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
  const updateRef = useRef<HTMLTextAreaElement>(null)
  const [showForm, setShowForm] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const { addItem } = useStorageContext()

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

  const handleSubmit = () => {
    if (!updateRef.current?.value) {
      return
    }

    addItem(`2026/exercises/${exercise.id}/updates`, {
      date: Temporal.Now.plainDateISO(),
      update: updateRef.current.value,
    })
  }

  return (
    <tr>
      <th role="rowheader">{exercise.name}</th>
      {exercise.updates.map(({ date, update, recommendation }) => {
        const { day, month, year } = formatDate(date)
        return (
          <td key={date.toString()}>
            <div className="date">
              {day} {month} {year}
            </div>
            {update}
            {recommendation && (
              <RecommendationIcon recommendation={recommendation} />
            )}
          </td>
        )
      })}
      <td>
        {showForm ? (
          <form aria-label={`Record ${exercise.name}`}>
            <textarea
              ref={updateRef}
              aria-label="Update"
              onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
            />
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            aria-label={`Record ${exercise.name}`}
          >
            <PlusIcon colour="var(--text-subtle)" width="25%" />
          </button>
        )}
      </td>
      {emptyCells.length > 1 &&
        emptyCells.slice(1).map((_, index) => <td key={`${index}`} />)}
    </tr>
  )
}

function RecommendationIcon({
  recommendation,
}: {
  recommendation: Recommendation
}) {
  const Icon = recommendationIcons[recommendation]

  return (
    <div className="recommendation">
      <Icon width="24px" colour="white" strokeWidth="6" />
      <Icon
        role="img"
        aria-label={recommendation}
        width="24px"
        colour="var(--action-colour)"
        strokeWidth="4"
      />
    </div>
  )
}

const recommendationIcons: Record<
  Recommendation,
  (props: IconProps) => JSX.Element
> = {
  increase: ChevronUpIcon,
  decrease: ChevronDownIcon,
  "no change": EqualIcon,
}
