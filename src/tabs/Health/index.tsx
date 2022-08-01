// <-> firebase
// navigate between months
// show streaks

import { Flex } from "@chakra-ui/react"
import { format, getDaysInMonth } from "date-fns"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Day } from "./Day"
import { Trackers } from "./types"

const getEmptyMonth = (date: Date) =>
  Object.fromEntries(
    Array.from({ length: getDaysInMonth(date) }).map((_, index) => [
      index + 1,
      {},
    ])
  )

export function Health() {
  const { read, write } = useContext(FirebaseContext)

  const today = useMemo(() => new Date(), [])
  const [days, setDays] = useState(getEmptyMonth(today))

  useEffect(() => {
    read(`health/${format(today, "yyyy/MM")}`, (value) => {
      setDays(value)
    })
  }, [read, today])

  const onChange = useCallback(
    (trackers: Trackers, day: string) => {
      write(`health/${format(today, "yyyy/MM")}/${day}`, trackers)
    },
    [write, today]
  )

  return (
    <Flex wrap="wrap">
      {Object.keys(days).map((day) => (
        <Day key={day} day={day} mx="2px" my="8px" onChange={onChange} />
      ))}
    </Flex>
  )
}
