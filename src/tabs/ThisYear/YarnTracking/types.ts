export const yarnTypes = ["sock yarn", "wool", "acrylic", "cotton"]

export type YarnType = (typeof yarnTypes)[number]

export type Update = {
  balance: number
  date: number
}

export type YarnDetails = {
  id: YarnType
  history: Update[]
}

export type MonthBalances = {
  total: number
  perYarnType: Record<YarnType, number>
}

export const KEY = "2025/yarn"
