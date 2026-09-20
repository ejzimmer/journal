import { CSSProperties, MouseEvent } from "react"
import { isSameDay, differenceInDays } from "date-fns"
import { WeeklyTask } from "../../../shared/types"
import { dateToWeekday, getCompletedDates } from "./utils"

type ProgressIndicatorProps = Pick<
  WeeklyTask,
  "completed" | "frequency" | "description"
> & {
  onAdd: (event: MouseEvent) => void
  onRemove: () => void
}

export function ProgressIndicator({
  completed,
  frequency,
  description,
  onAdd,
  onRemove,
}: ProgressIndicatorProps) {
  const completedDates = getCompletedDates(completed)
  const numberDone = completedDates.length
  const remainder = Math.max(numberDone - frequency, 0)
  const filledSegments = Math.min(numberDone, frequency)

  const mostRecentlyDone = numberDone ? Math.max(...completedDates) : undefined
  const doneToday =
    !!mostRecentlyDone && isSameDay(mostRecentlyDone, new Date())
  const daysSinceDone = mostRecentlyDone
    ? differenceInDays(new Date(), mostRecentlyDone)
    : 0
  const fillOpacity =
    daysSinceDone > 2 ? Math.max(0, 1 - 0.2 * (daysSinceDone - 2)) : 1

  return (
    <div className="indicators">
      <div
        role="group"
        aria-label={`${description}: ${numberDone} of ${frequency} done`}
        className={`progress-bar ${doneToday ? "done-today" : ""}`}
        style={
          {
            "--segments": frequency,
            "--fill-opacity": fillOpacity,
          } as CSSProperties
        }
      >
        {filledSegments > 0 && (
          <button
            className="done"
            aria-label="Undo"
            onClick={onRemove}
            style={{ width: `${(filledSegments / frequency) * 100}%` }}
          />
        )}
        {filledSegments < frequency && (
          <button className="not-done" aria-label="Mark done" onClick={onAdd} />
        )}
      </div>
      {remainder > 0 && <span className="remainder">+{remainder}</span>}
      {numberDone > 0 && (
        <ol className="dates-popover">
          {completedDates.map((date) => (
            <li key={date}>{dateToWeekday(date)}</li>
          ))}
        </ol>
      )}
    </div>
  )
}
