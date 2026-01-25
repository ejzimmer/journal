import { addDays, differenceInCalendarDays, startOfDay } from "date-fns"
import { useContext, useMemo } from "react"

import "./Days.css"
import { Day } from "./Day"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { DayData, TrackerContext } from "./types"

const PATH = "2026/daily"

const dateFormatter = Intl.DateTimeFormat("en-AU", {
  month: "short",
})

const formatDate = (date: Date) => {
  const day = date.getDate()
  const month = dateFormatter
    .formatToParts(day)
    .find((part) => part.type === "month")!.value

  return { day, month }
}

export function Days() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("no storage context")
  }
  const { value } = storageContext.useValue<DayData>(PATH)

  const days = useMemo(() => setupDays(value), [value])
  const trackers = useMemo(
    () =>
      value &&
      Array.from(
        new Set(
          Object.values(value)
            .flatMap((day) => day.trackers)
            .filter(Boolean) as string[],
        ),
      ),
    [value],
  )

  return (
    <TrackerContext.Provider value={trackers}>
      <ol className="days">
        {days.map(({ day, month, balance, diff }) => {
          const id = day + month
          const dayData = (value?.[id] as DayData) ?? { id }

          return (
            <li key={day.toString()} className={getDayClass(diff)}>
              <Day
                path={PATH}
                date={{ day, month }}
                balance={balance}
                {...dayData}
              />
            </li>
          )
        })}
      </ol>
    </TrackerContext.Provider>
  )
}

type Balance = { day: number; month: string; balance?: number; diff?: number }

function setupDays(dayData?: Record<string, DayData>): Balance[] {
  const today = startOfDay(new Date())
  const newYearsDay = startOfDay(new Date("2026-01-01"))
  const numberOfDays = differenceInCalendarDays(today, newYearsDay) - 1
  const days = new Array<Balance>(numberOfDays)

  for (let i = 0; i <= numberOfDays; i += 1) {
    const date = addDays(newYearsDay, i)
    const previousBalance = i === 0 ? 19687 : days[i - 1].balance
    const { day, month } = formatDate(date)
    const { consumed, expended } = dayData?.[day + month] ?? {}
    const diff = consumed && expended && expended - consumed
    if (typeof previousBalance === "number" && typeof diff === "number") {
      days[i] = { day, month, balance: previousBalance - diff, diff }
    } else {
      days[i] = { day, month }
    }
  }

  return days
}

const getDayClass = (diff?: number) => {
  if (typeof diff !== "number") {
    return ""
  }

  return diff > 0 ? "balance-down" : "balance-up"
}
