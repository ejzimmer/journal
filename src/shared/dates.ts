const monthFormatter = Intl.DateTimeFormat("en-AU", { month: "short" })

export const getToday = () => Temporal.Now.plainDateISO()

export const getDateFromTimestamp = (timestamp: number) =>
  Temporal.Instant.fromEpochMilliseconds(timestamp)
    .toZonedDateTimeISO(Temporal.Now.timeZoneId())
    .toPlainDate()

export const getTimestampFromDate = (date: Temporal.PlainDate) =>
  date.toZonedDateTime(Temporal.Now.timeZoneId()).epochMilliseconds

export const isToday = (timestamp: number) =>
  getDateFromTimestamp(timestamp).equals(getToday())

export const isBeforeToday = (timestamp: number) =>
  Temporal.PlainDate.compare(getDateFromTimestamp(timestamp), getToday()) < 0

export const isAfterToday = (timestamp: number) =>
  Temporal.PlainDate.compare(getDateFromTimestamp(timestamp), getToday()) > 0

export const getDaysSince = (timestamp: number) =>
  getToday().since(getDateFromTimestamp(timestamp), { largestUnit: "day" }).days

export const getStartOfWeek = (date: Temporal.PlainDate) =>
  date.subtract({ days: date.dayOfWeek - 1 })

export const getMillisecondsUntilTomorrow = () => {
  const now = Temporal.Now.zonedDateTimeISO()

  return (
    now.startOfDay().add({ days: 1 }).epochMilliseconds - now.epochMilliseconds
  )
}

export const formatDateId = (date: Temporal.PlainDate) => date.toString()

const formatMonth = (date: Temporal.PlainDate) =>
  monthFormatter.format(date).substring(0, 3)

export const formatDate = (date: Temporal.PlainDate) => ({
  day: date.day,
  month: formatMonth(date),
  year: date.year.toString().substring(2),
})

export const formatDayAndMonth = (date: Temporal.PlainDate) =>
  `${date.day.toString().padStart(2, "0")} ${formatMonth(date)}`
