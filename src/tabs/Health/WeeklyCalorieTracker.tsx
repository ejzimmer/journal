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
  // a surplus week can push the balance above STARTING_BALANCE - scale
  // against whichever is bigger so the tallest bar never exceeds 100%
  // (and doesn't get clipped by the container)
  const heightScale = Math.max(highestBalance, STARTING_BALANCE)

  return (
    <div className="weekly-calories">
      {weeklyBalances.map((balance, index) => (
        <div className="week-container" key={index}>
          <div
            className={getWeekClass({ balance, highestBalance, lowestBalance })}
            style={{ height: (balance.balance / heightScale) * 100 + "%" }}
            role="img"
            aria-label={`${balance.day} ${balance.month}: ${balance.balance.toLocaleString()}`}
          />
          <div className="week-hovertext">
            {balance.day} {balance.month}: {balance.balance.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}
