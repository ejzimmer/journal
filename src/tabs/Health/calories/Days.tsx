import { CSSProperties, useMemo } from "react"

import "./Days.css"
import { Balance } from "../utils"
import { PeriodIcons } from "./PeriodIcons"

type DaysProps = {
  days: Balance[]
  onSelectDay: (dayId: string) => void
}

export function Days({ days, onSelectDay }: DaysProps) {
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
          key={day.id}
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
          <button
            type="button"
            className="day-button"
            aria-label={`update ${day.day} ${day.month}`}
            onClick={() => onSelectDay(day.id)}
          >
            <div className="day-details" style={{ textAlign: "center" }}>
              <b>
                {day.day} {day.month}
              </b>
              <div>{day.balance?.toLocaleString()}</div>
            </div>
          </button>
          <PeriodIcons trackers={day.trackers} />
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

  // Linear interpolation between white (intensity 0) and the full colour (intensity 1).
  const lightness = intensity * 78 + (1 - intensity) * 100
  const chroma = intensity * 230

  return `lch(${lightness}% ${chroma} ${hue})`
}
