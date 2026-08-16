export const KEY = "2026/yarn"

export type Yarn = Record<string, YarnType>
export type YarnType = { id: string; history: Record<string, number> } // Record<month, balance>

export type History = Record<string, Month>
export type Month = {
  month: string
  total: number
  subTotals: TotalsByType
}
export type TotalsByType = Record<string, number> // Record<yarnType, amount>
