import { addDays, differenceInCalendarDays, startOfDay } from "date-fns"
import { useContext, useMemo } from "react"

import "./WeeklyCalorieTracker.css"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { formatDate } from "../../shared/utils"
import { DAILY_PATH, DayData } from "../../shared/types"

const STARTING_BALANCE = 19687

type Balance = {
  day: number
  month: string
  balance?: number
  diff?: number
}

export function WeeklyCalorieTracker() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("no storage context")
  }
  const { value } = storageContext.useValue<Record<string, DayData>>(DAILY_PATH)

  const days = useMemo(() => setupDays(value), [value])
  const weeklyBalances = useMemo(() => getWeeklyBalance(days), [days])

  const weekBalances = weeklyBalances.map((balance) => balance.balance)
  const highestBalance = Math.max(...weekBalances)
  const lowestBalance = Math.min(...weekBalances)

  return (
    <div className="weekly-calories">
      {weeklyBalances.map((balance, index) => (
        <div className="week-container" key={index}>
          <div
            className={getWeekClass({ balance, highestBalance, lowestBalance })}
            style={{ height: (balance.balance / STARTING_BALANCE) * 100 + "%" }}
          />
          <div className="week-hovertext">
            {balance.day} {balance.month}: {balance.balance.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}

function setupDays(dayData?: Record<string, DayData>): Balance[] {
  const today = startOfDay(new Date())
  const newYearsDay = startOfDay(new Date("2026-01-01"))
  const numberOfDays = differenceInCalendarDays(today, newYearsDay)
  const days = new Array<Balance>(numberOfDays)

  for (let i = 0; i <= numberOfDays; i += 1) {
    const date = addDays(newYearsDay, i)
    const previousBalance = i === 0 ? STARTING_BALANCE : days[i - 1].balance
    const { day, month } = formatDate(date)
    const { consumed, expended } = dayData?.[day + month] ?? {}
    const diff = consumed && expended && expended - consumed

    const daySummary = { day, month }
    if (typeof previousBalance === "number" && typeof diff === "number") {
      days[i] = { ...daySummary, balance: previousBalance - diff, diff }
    } else {
      days[i] = daySummary
    }
  }

  return days
}

const getWeeklyBalance = (balances: Balance[]): Required<Balance>[] => {
  const weeklyBalances = balances.filter(
    (b, index) => index % 7 === 6 && b.balance,
  ) as Required<Balance>[]

  const lastCompleteIndex = balances.findLastIndex(
    (b) => typeof b.balance === "number",
  )
  const lastComplete = balances[lastCompleteIndex] as
    | Required<Balance>
    | undefined

  return lastComplete && lastCompleteIndex % 7 !== 6
    ? [...weeklyBalances, lastComplete]
    : weeklyBalances
}

const getWeekClass = ({
  balance,
  highestBalance,
  lowestBalance,
}: {
  balance: Required<Balance>
  highestBalance: number
  lowestBalance: number
}) => {
  if (balance.balance === highestBalance) {
    return "week week-highest"
  }
  if (balance.balance === lowestBalance) {
    return "week week-lowest"
  }
  return "week"
}
