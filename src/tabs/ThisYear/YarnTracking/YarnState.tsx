import { useContext } from "react"
import { KEY, YarnDetails } from "./types"

import "./YarnState.css"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { getInitialBalances, getMonthlyBalances, percent } from "./utils"
import { MonthlyBalance } from "./MonthlyBalance"

export function YarnState() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const { value } = storageContext.useValue<YarnDetails>(KEY)
  if (!value) {
    return <>Loading...</>
  }

  const initialBalances = getInitialBalances(value)
  const monthlyBalances = getMonthlyBalances(value)
  const maximumBalance = Math.max(
    initialBalances.total,
    ...monthlyBalances.map((month) => month.total)
  )

  return (
    <div className="yarn-state">
      <ol>
        <li style={{ width: percent(initialBalances.total, maximumBalance) }}>
          <div className="label">
            Initial: {initialBalances.total.toLocaleString()}g
          </div>
          <MonthlyBalance {...initialBalances} />
        </li>
        {monthlyBalances.map((month, index) => (
          <li
            key={index}
            style={{ width: percent(month.total, maximumBalance) }}
          >
            <MonthLabel
              monthNumber={index + 1}
              monthTotal={month.total}
              isLastMonth={index === monthlyBalances.length - 1}
            />
            <MonthlyBalance {...month} />
          </li>
        ))}
      </ol>
    </div>
  )
}

function MonthLabel({
  monthNumber,
  monthTotal,
  isLastMonth,
}: {
  monthNumber: number
  monthTotal: number
  isLastMonth: boolean
}) {
  const monthName = new Date(`2000-${monthNumber}-01`).toLocaleString(
    "default",
    {
      month: "long",
    }
  )

  return (
    <div className="label">
      {isLastMonth ? "Current" : monthName}: {monthTotal.toLocaleString()}g
    </div>
  )
}
