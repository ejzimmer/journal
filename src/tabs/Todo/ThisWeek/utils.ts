const dateFormatter = Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  day: "numeric",
})
const suffixes = ["th", "st", "nd", "rd"]

export const dateToWeekday = (date: number) => {
  const formatted = dateFormatter.format(new Date(date))
  const secondLastDigit = formatted.at(-2)
  const lastDigit = formatted.at(-1)
  const suffixIndex = lastDigit ? Number.parseInt(lastDigit) : -1

  if (secondLastDigit === "1") {
    return `${formatted}th`
  }

  return `${formatted}${suffixes[suffixIndex] ?? "th"}`
}
