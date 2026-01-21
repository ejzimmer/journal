import { MonthBalances, yarnTypes } from "./types"
import { percent } from "./utils"

export function MonthlyBalance({ total, perYarnType }: MonthBalances) {
  return (
    <div className="yarn-month">
      {yarnTypes.map((yarnType) => (
        <div
          key={yarnType}
          style={{ width: percent(perYarnType[yarnType], total) }}
        >
          <div className="details">
            {yarnType}: {perYarnType[yarnType].toLocaleString()}g
          </div>
        </div>
      ))}
    </div>
  )
}
