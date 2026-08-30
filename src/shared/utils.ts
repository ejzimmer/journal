import { format } from "date-fns"

const dateFormatter = Intl.DateTimeFormat("en-AU", {
  month: "short",
})

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
