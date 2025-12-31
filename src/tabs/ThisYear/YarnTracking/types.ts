export const yarnTypes = ["sock yarn", "wool", "acrylic", "cotton"]

export type YarnType = (typeof yarnTypes)[number]

type Update = {
  balance: number
  date: number
}

export type YarnDetails = {
  id: YarnType
  history: Update[]
}

export const KEY = "2025/yarn"
