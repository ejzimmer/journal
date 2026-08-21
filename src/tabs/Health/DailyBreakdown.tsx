import { CSSProperties, useContext, useMemo } from "react"
import { Temporal } from "temporal-polyfill"

import "./DailyBreakdown.css"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { DAILY_PATH, DayData } from "../../shared/types"
import { Balance, setupDays } from "./utils"

export function DailyBreakdown() {
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
          className="day-circle"
          style={
            {
              animationDelay: `${popDelays[index]}s`,
              ...(typeof day.diff === "number"
                ? { "--day-colour": getDayColour(day.diff, maxDiff) }
                : {}),
            } as CSSProperties
          }
        >
          {day.day}/{day.monthNumber}
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
  const isIncrease = diff < 0

  const hue = isIncrease ? 32 : 105
  const saturation = lerp(isIncrease ? 35 : 25, isIncrease ? 95 : 85, intensity)
  const lightness = lerp(85, isIncrease ? 55 : 38, intensity)

  return `hsl(${hue} ${saturation}% ${lightness}%)`
}

const lerp = (min: number, max: number, t: number) => min + (max - min) * t
