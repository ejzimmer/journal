import { format } from "date-fns"

import { DayData } from "./types"

const dateFormatter = Intl.DateTimeFormat("en-AU", {
  month: "short",
})
const MONTH_ABBREVIATIONS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]
const CANONICAL_ID = /^\d{4}-\d{2}-\d{2}$/
const LEGACY_ID = /^(\d{1,2})([A-Za-z]{3})$/

export const formatDateId = (date: Date) => format(date, "yyyy-MM-dd")

export const formatDate = (date: Date) => {
  const day = date.getDate()
  const month = dateFormatter
    .formatToParts(date)
    .find((part) => part.type === "month")!
    .value.substring(0, 3)
  const year = date.getFullYear().toString().substring(2)

  return { day, month, year }
}

// Ids written before the yyyy-mm-dd migration are just "5Jan" with no year.
// Since they only ever existed for 2026, that's the year we assume for them.
export const normalizeDayId = (id: string) => {
  if (CANONICAL_ID.test(id)) {
    return id
  }

  const match = id.match(LEGACY_ID)
  if (!match) {
    return id
  }

  const [, day, month] = match
  const monthIndex = MONTH_ABBREVIATIONS.indexOf(month)
  if (monthIndex === -1) {
    return id
  }

  return formatDateId(new Date(2026, monthIndex, Number(day)))
}

export const normalizeDailyData = (
  data?: Record<string, DayData>,
): Record<string, DayData> => {
  if (!data) {
    return {}
  }

  const entries = Object.entries(data).map(
    ([key, value]) => [key, normalizeDayId(key), value] as const,
  )

  const normalized: Record<string, DayData> = {}
  for (const [key, id, value] of entries) {
    if (id !== key) {
      normalized[id] = { ...normalized[id], ...value, id }
    }
  }
  for (const [key, id, value] of entries) {
    if (id === key) {
      normalized[id] = { ...normalized[id], ...value, id }
    }
  }

  return normalized
}

export const CATEGORIES = [
  "🧹",
  "🏃‍♀️",
  "🧽",
  "🍞",
  "🇯🇵",
  "🪡",
  "🧶",
  "👩‍💻",
  "🧑‍🤝‍🧑",
  "💰",
  "🎤",
  "✈️",
  "🧘",
  "🖍️",
  "🇫🇷",
]
