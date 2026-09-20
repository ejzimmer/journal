import { getTimestampFromDate, getToday } from "./dates"

export const getTimestampDaysAgo = (days: number) =>
  getTimestampFromDate(getToday().subtract({ days }))

export const getTimestampDaysAhead = (days: number) =>
  getTimestampFromDate(getToday().add({ days }))
