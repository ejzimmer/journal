import { CSSProperties, useContext, useMemo } from "react"

import "./Days.css"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { DAILY_PATH, DayData } from "../../shared/types"
import { Balance, setupDays } from "./utils"

export function Days() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("no storage context")
  }
  const { value } = storageContext.useValue<Record<string, DayData>>(DAILY_PATH)

  const days = useMemo(() => setupDays(value), [value])
  const maxDiff = useMemo(
    () =>
      days.reduce(
        (max, { diff }) =>
          typeof diff === "number" ? Math.max(max, Math.abs(diff)) : max,
        0,
      ),
    [days],
  )
  const popDelays = useMemo(() => days.map(() => Math.random() * 0.3), [days])
  const startingIndex = days[0] ? weekday(days[0]) : 1

  return (
    <ol
      className="day-grid"
      aria-label="by day"
      style={{ "--starting-index": startingIndex } as CSSProperties}
    >
      {days.map((day, index) => (
        <li
          key={`${day.day}-${day.month}`}
          className="day-circle hovertext-anchor"
          style={
            {
              animationDelay: `${popDelays[index]}s`,
              ...(typeof day.diff === "number"
                ? { "--day-colour": getDayColour(day.diff, maxDiff) }
                : {}),
            } as CSSProperties
          }
        >
          <div className="hovertext" style={{ textAlign: "center" }}>
            <i>
              {day.day}/{day.monthNumber}
            </i>
            <br />
            {day.balance?.toLocaleString()}
          </div>
        </li>
      ))}
    </ol>
  )
}

const weekday = (day: Balance) =>
  Temporal.PlainDate.from({ year: 2026, month: day.monthNumber, day: day.day })
    .dayOfWeek

function getDayColour(diff: number, maxDiff: number) {
  const intensity = maxDiff === 0 ? 1 : Math.min(Math.abs(diff) / maxDiff, 1)
  const hue = diff < 0 ? 77 : 104

  return `lch(78% 230 ${hue} / ${intensity})`
}
