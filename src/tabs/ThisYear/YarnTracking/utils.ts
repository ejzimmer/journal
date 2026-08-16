import { Yarn, History, Month, TotalsByType } from "./types"

// Takes state by type, returns state by month
export function getHistoryByMonth(yarnState: Yarn): History {
  const today = new Date()
  const months = setupMonths(today.getMonth(), today.getFullYear())

  Object.values(yarnState).forEach(({ id, history }) => {
    Object.entries(history).forEach(([month, balance]) => {
      if (!months[month]) {
        months[month] = {
          month,
          total: 0,
          subTotals: {},
        }
      }

      months[month].subTotals[id] = balance
      months[month].total = months[month].total + balance
    })
  })

  const filledInMonths = fillInMonths(months, Object.keys(yarnState))

  const thisMonth = getMonthId(today.getFullYear(), today.getMonth())
  if (!filledInMonths[thisMonth]) {
    const lastMonth = Object.values(filledInMonths).at(-1) ?? {
      month: thisMonth,
      total: 0,
      subTotals: {},
    }
    filledInMonths[thisMonth] = { ...lastMonth, month: thisMonth }
  }

  return filledInMonths
}

const setupMonths = (
  numberOfMonths: number,
  year: number,
): Record<string, Month> => {
  const months: Record<string, Month> = {}

  for (let month = 0; month < numberOfMonths; month++) {
    const id = getMonthId(year, month)
    months[id] = { month: id, total: 0, subTotals: {} }
  }

  return months
}

const fillInMonths = (history: History, yarnTypes: string[]): History => {
  const updatedHistory: Month[] = []

  Object.values(history).forEach((month, index) => {
    const thisMonthYarnTypes = Object.keys(month.subTotals)
    if (thisMonthYarnTypes.length === yarnTypes.length) {
      updatedHistory.push(month)
      return
    }

    const previousSubTotals = updatedHistory[index - 1]?.subTotals ?? {}
    const newSubTotals = Object.fromEntries(
      yarnTypes.map((type) => [
        type,
        month.subTotals[type] ?? previousSubTotals[type] ?? 0,
      ]),
    )
    updatedHistory.push({
      ...month,
      total: sumSubTotals(newSubTotals),
      subTotals: newSubTotals,
    })
  })

  return Object.fromEntries(updatedHistory.map((month) => [month.month, month]))
}

const sumSubTotals = (subTotals: TotalsByType) =>
  Object.values(subTotals).reduce((current, total) => total + current, 0)

export const getMonthId = (year: number, month: number) =>
  `${year}`.substring(2) + "-" + `${month + 1}`.padStart(2, "0")
