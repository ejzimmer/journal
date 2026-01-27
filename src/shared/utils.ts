const dateFormatter = Intl.DateTimeFormat("en-AU", {
  month: "short",
})

export const formatDate = (date: Date) => {
  const day = date.getDate()
  const month = dateFormatter
    .formatToParts(day)
    .find((part) => part.type === "month")!.value

  return { day, month }
}
