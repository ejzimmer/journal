import { useContext } from "react"
import { KEY, Yarn } from "./types"

import "./YarnState.css"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { getHistoryByMonth } from "./utils"
import { MonthlyBalance } from "./MonthlyBalance"

export function YarnState() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const { value } = storageContext.useValue<Yarn>(KEY)

  if (!value) {
    return <>Loading...</>
  }

  const monthEntries = Object.entries(getHistoryByMonth(value))
  const maxTotal = Math.max(...monthEntries.map(([, month]) => month.total))

  return (
    <div className="yarn-state">
      <ol>
        {monthEntries.map(([id, month], index) => (
          <li key={id} style={{ width: `${(month.total / maxTotal) * 100}%` }}>
            <MonthLabel
              monthNumber={id.split("-")[1]}
              monthTotal={month.total}
              isLastMonth={index === monthEntries.length - 1}
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
  monthNumber: string
  monthTotal: number
  isLastMonth: boolean
}) {
  const monthName = new Date(`2000-${monthNumber}-01`).toLocaleString(
    "default",
    {
      month: "long",
    },
  )

  return (
    <div className="label">
      {isLastMonth ? "Current" : monthName}: {monthTotal.toLocaleString()}g
    </div>
  )
}
