import { useMemo } from "react"

import "./WeeklyCalorieTracker.css"
import {
  Balance,
  STARTING_BALANCE,
  getWeekClass,
  getWeeklyBalance,
} from "../utils"

type WeeklyCalorieTrackerProps = {
  days: Balance[]
}

export function WeeklyCalorieTracker({ days }: WeeklyCalorieTrackerProps) {
  const weeklyBalances = useMemo(() => getWeeklyBalance(days), [days])

  const weekBalances = weeklyBalances.map((balance) => balance.balance)
  const highestBalance = Math.max(...weekBalances)
  const lowestBalance = Math.min(...weekBalances)
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
          <div className="hovertext">
            {balance.day} {balance.month}: {balance.balance.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}
