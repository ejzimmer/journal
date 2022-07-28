// <-> firebase
// navigate between months
// show streaks

import { Flex } from "@chakra-ui/react"
import { getDaysInMonth } from "date-fns"
import { Day } from "./Day"

export function Health() {
  const today = new Date()
  const daysInMonth = Array.from({ length: getDaysInMonth(today) }).map(
    (_, index) => new Date(today.getFullYear(), today.getMonth(), index + 1)
  )

  return (
    <Flex wrap="wrap">
      {daysInMonth.map((date) => (
        <Day key={date.getDate()} date={date} mx="2px" my="8px" />
      ))}
    </Flex>
  )
}
