// <-> firebase
// show days of week
// navigate between months
// show streaks

import { Grid } from "@chakra-ui/react"
import { format, getDaysInMonth } from "date-fns"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { Day } from "./Day"
import { initialiseDay, Trackers } from "./types"

const getEmptyMonth = (date: Date): Record<string, Trackers> => {
  const month: [string, Trackers][] = Array.from({
    length: getDaysInMonth(date),
  }).map((_, index) => [`${index + 1}`.padStart(2, "0"), initialiseDay()])

  return Object.fromEntries(month)
}

export function Health() {
  const { read, write } = useContext(FirebaseContext)

  const today = useMemo(() => new Date(), [])
  const [days, setDays] = useState(getEmptyMonth(today))

  useEffect(() => {
    read(`health/${format(today, "yyyy/MM")}`, (value) => {
      setDays((days) => ({ ...days, ...value }))
    })
  }, [read, today])

  const onChange = useCallback(
    (trackers: Trackers, day: string) => {
      write(`health/${format(today, "yyyy/MM")}/${day}`, trackers)
    },
    [write, today]
  )

  return (
    <Grid gridTemplateColumns="repeat(7, min-content)" justifyContent="center">
      {Object.entries(days)
        .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
        .map(([day, trackers]) => (
          <Day
            key={day}
            day={day}
            trackers={trackers}
            mx="2px"
            my="8px"
            onChange={onChange}
          />
        ))}
    </Grid>
  )
}
