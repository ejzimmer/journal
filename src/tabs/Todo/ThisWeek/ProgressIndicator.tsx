import { CSSProperties } from "react"
import isSameDay from "date-fns/isSameDay"
import differenceInDays from "date-fns/differenceInDays"
import { WeeklyTask } from "../../../shared/types"
import { dateToWeekday } from "./utils"

type ProgressIndicatorProps = Pick<WeeklyTask, "completed" | "frequency">
export function ProgressIndicator({
  completed,
  frequency,
}: ProgressIndicatorProps) {
  const completedList = Array.isArray(completed)
    ? completed
    : (Object.values(completed ?? {}) as number[])
  const numberDone = (completedList.filter((date) => !!date) ?? []).length
  const remainder = Math.max(numberDone - frequency, 0)
  const percent = (1 / frequency) * 100

  const mostRecentlyDone = completedList.at(-1)
  const doneToday = mostRecentlyDone && isSameDay(mostRecentlyDone, new Date())

  const daysSinceDone = mostRecentlyDone
    ? differenceInDays(new Date(), mostRecentlyDone)
    : 0
  const fillOpacity =
    daysSinceDone > 2 ? Math.max(0, 1 - 0.05 * (daysSinceDone - 2)) : 1

  return (
    <div className="indicators">
      <progress
        max={frequency}
        value={numberDone}
        className={`${numberDone >= frequency ? "full" : ""} ${doneToday ? "done-today" : ""}`}
        style={
          {
            backgroundColor: "#eee",
            backgroundImage: `repeating-linear-gradient(to right, transparent, transparent ${percent}%, var(--body-colour-light) ${percent}%, var(--body-colour-light) calc(${percent}% + 1px))`,
            "--fill-opacity": fillOpacity,
          } as CSSProperties
        }
      />
      {remainder > 0 && <span className="remainder">+{remainder}</span>}
      {numberDone > 0 && (
        <ol className="dates-popover">
          {completedList.map(
            (date) => date && <li key={date}>{dateToWeekday(date)}</li>,
          )}
        </ol>
      )}
    </div>
  )
}
