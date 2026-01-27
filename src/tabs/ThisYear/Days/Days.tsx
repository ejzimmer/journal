import { addDays, differenceInCalendarDays, startOfDay } from "date-fns"
import { useContext, useMemo, useState } from "react"

import "./Days.css"
import { Day } from "./Day"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { DayData, HABITS, TrackerContext } from "./types"
import { EmojiCheckbox } from "../../../shared/controls/EmojiCheckbox"
import { toggleListItem } from "./utils"

const PATH = "2026/daily"
const STARTING_BALANCE = 19687

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
  const [filters, setFilters] = useState<string[]>([])

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("no storage context")
  }
  const { value } = storageContext.useValue<DayData>(PATH)

  const days = useMemo(() => setupDays(value), [value])
  const weeklyBalances = useMemo(() => getWeeklyBalance(days), [days])
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
    <div className="daily">
      <WeeklyCalories balances={weeklyBalances} />
      <TrackerContext.Provider value={trackers}>
        <Filters filters={filters} onChange={setFilters} />
        <ol className="days">
          {days.map(({ day, month, balance, diff }) => {
            const id = day + month
            const dayData = (value?.[id] as DayData) ?? { id }

            return (
              <li
                key={day.toString()}
                className={getDayClass({ filters, day: dayData, diff })}
              >
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
    </div>
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
    const previousBalance = i === 0 ? STARTING_BALANCE : days[i - 1].balance
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

const getWeeklyBalance = (balances: Balance[]): number[] =>
  balances
    .filter((b, index) => index % 7 === 6 && b.balance)
    .map((balance) => balance.balance as number)

const getDayClass = ({
  day,
  filters,
  diff,
}: {
  day: DayData
  filters: string[]
  diff?: number
}) => {
  let classes = ""

  if (typeof diff === "number") {
    classes = diff > 0 ? "balance-down" : "balance-up"
  }

  const filtered = [day.habits, day.trackers].flat()
  if (
    filters.length > 0 &&
    filters.some((filter) => filtered.includes(filter))
  ) {
    classes += " highlight"
  }

  return classes.trim()
}

type FiltersProps = {
  filters: string[]
  onChange: (filters: string[]) => void
}

function Filters({ filters, onChange }: FiltersProps) {
  const trackers = useContext(TrackerContext) ?? []

  return (
    <ul className="daily-filters">
      {[...HABITS, ...trackers].map((filter) => (
        <EmojiCheckbox
          key={filter}
          emoji={filter}
          label={`filter by ${filter}`}
          isChecked={filters.includes(filter)}
          onChange={() => onChange(toggleListItem(filters, filter))}
        />
      ))}
    </ul>
  )
}

function WeeklyCalories({ balances }: { balances: number[] }) {
  return (
    <div className="weekly">
      {balances.map((balance) => (
        <div
          className="week"
          style={{ width: (balance / STARTING_BALANCE) * 100 + "%" }}
        />
      ))}
    </div>
  )
}
