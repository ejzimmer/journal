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

const FULL_LIGHTNESS = 78
const FULL_CHROMA = 230

function getDayColour(diff: number, maxDiff: number) {
  const intensity = maxDiff === 0 ? 1 : Math.min(Math.abs(diff) / maxDiff, 1)
  const hue = diff < 0 ? 77 : 104

  // Fades toward white (lightness 100%, chroma 0) as intensity drops, so the
  // result is always a fully opaque colour rather than a translucent one.
  const lightness = 100 - intensity * (100 - FULL_LIGHTNESS)
  const chroma = intensity * FULL_CHROMA

  return `lch(${lightness}% ${chroma} ${hue})`
}
