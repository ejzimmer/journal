import { Month } from "./types"

export function MonthlyBalance({ total, subTotals }: Month) {
  const yarnTypes = Object.keys(subTotals)

  return (
    <div className="yarn-month">
      {yarnTypes.map((yarnType) => (
        <div
          key={yarnType}
          style={{ width: `${(subTotals[yarnType] / total) * 100}%` }}
        >
          <div className="details">
            {yarnType}: {subTotals[yarnType].toLocaleString()}g
          </div>
        </div>
      ))}
    </div>
  )
}
