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

  return (
    <div className="indicators">
      <progress
        max={frequency}
        value={numberDone}
        className={numberDone >= frequency ? "full" : ""}
        style={{
          backgroundColor: "#eee",
          backgroundImage: `repeating-linear-gradient(to right, transparent, transparent ${percent}%, var(--body-colour-light) ${percent}%, var(--body-colour-light) calc(${percent}% + 1px))`,
        }}
      />
      {remainder > 0 && <span className="remainder">+{remainder}</span>}
      {completedList && (
        <ol className="dates-popover">
          {completedList.map(
            (date) => date && <li key={date}>{dateToWeekday(date)}</li>,
          )}
        </ol>
      )}
    </div>
  )
}
