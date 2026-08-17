import { useContext, useMemo } from "react"

import "./WeeklyCalorieTracker.css"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { DAILY_PATH, DayData } from "../../shared/types"
import { STARTING_BALANCE, getWeekClass, getWeeklyBalance, setupDays } from "./utils"

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
