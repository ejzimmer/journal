import { addDays, differenceInCalendarDays, startOfDay } from "date-fns"

import { formatDate } from "../../shared/utils"
import { DayData } from "../../shared/types"

export const STARTING_BALANCE = 19687

export type Balance = {
  day: number
  month: string
  monthNumber: number
  dayOfWeek: number
  balance?: number
  diff?: number
}

export function setupDays(dayData?: Record<string, DayData>): Balance[] {
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

    const daySummary = {
      day,
      month,
      monthNumber: date.getMonth() + 1,
      dayOfWeek: date.getDay(),
      diff: typeof diff === "number" ? diff : undefined,
    }
    days[i] =
      typeof previousBalance === "number" && typeof diff === "number"
        ? { ...daySummary, balance: previousBalance - diff }
        : daySummary
  }

  return days
}

export const getWeeklyBalance = (balances: Balance[]): Required<Balance>[] => {
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

export const getWeekClass = ({
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
