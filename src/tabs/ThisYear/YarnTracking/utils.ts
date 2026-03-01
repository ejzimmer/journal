import { MonthBalances, YarnDetails, YarnType, yarnTypes } from "./types"

export const sum = (total: number, current?: number) => total + (current ?? 0)
export const percent = (numerator: number, denominator: number) =>
  `${Math.round((numerator / denominator) * 1000) / 10}%`

export function getInitialBalances(yarnState: Record<YarnType, YarnDetails>) {
  return {
    total: Object.values(yarnState)
      .map((yarn) => yarn.history.at(0)?.balance ?? 0)
      .reduce(sum, 0),
    perYarnType: Object.fromEntries(
      yarnTypes.map((yarnType) => [
        yarnType,
        yarnState[yarnType].history[0].balance,
      ]),
    ),
  }
}

export function getMonthlyBalances(
  yarnState: Record<YarnType, YarnDetails>,
): MonthBalances[] {
  const months: MonthBalances[] = []

  Object.values(yarnState).forEach((yarn) => {
    yarn.history.forEach((update) => {
      const month = new Date(update.date).getMonth()

      if (months[month]) {
        months[month].perYarnType[yarn.id] = update.balance
      } else {
        months[month] = { total: 0, perYarnType: { [yarn.id]: update.balance } }
      }
    })
  })

  const monthsWithTotals = months.map((month) => {
    return {
      ...month,
      total: Object.values(month.perYarnType).reduce(sum, 0),
    }
  })

  monthsWithTotals.forEach((month, index) => {
    const lastMonth = monthsWithTotals[index - 1]
    if (!month) {
      monthsWithTotals[index] = lastMonth
    }

    yarnTypes.forEach((yarnType) => {
      if (!month.perYarnType[yarnType]) {
        month.perYarnType[yarnType] = lastMonth.perYarnType[yarnType]
        month.total = Object.values(month.perYarnType).reduce(sum, 0)
      }
    })
  })

  const thisMonth = new Date().getMonth()
  if (!monthsWithTotals[thisMonth]) {
    monthsWithTotals[thisMonth] = monthsWithTotals[thisMonth - 1]
  }

  return monthsWithTotals
}
