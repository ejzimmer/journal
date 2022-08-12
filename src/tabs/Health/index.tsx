// show days of week
// navigate between months & make start day right
// show streaks

import { Button, Grid, GridItem, Heading } from "@chakra-ui/react"
import {
  addMonths,
  format,
  getDaysInMonth,
  startOfMonth,
  subMonths,
} from "date-fns"
import { useCallback, useContext, useEffect, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { getWeekdays } from "../../shared/utilities"
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

  const [date, setDate] = useState(startOfMonth(new Date()))
  const [days, setDays] = useState(getEmptyMonth(date))

  const weekdays = getWeekdays(date)

  useEffect(() => {
    read(`health/${format(date, "yyyy/MM")}`, (value) => {
      setDays({ ...getEmptyMonth(date), ...value })
    })
  }, [read, date])

  const onChange = useCallback(
    (trackers: Trackers, day: string) => {
      write(`health/${format(date, "yyyy/MM")}/${day}`, trackers)
    },
    [write, date]
  )

  return (
    <>
      <Heading>{format(date, "MMMM")}</Heading>
      <Button onClick={() => setDate((date) => subMonths(date, 1))}>
        Back
      </Button>
      <Button onClick={() => setDate((date) => addMonths(date, 1))}>
        Forward
      </Button>
      <Grid
        gridTemplateColumns="repeat(7, min-content)"
        justifyContent="center"
        justifyItems="center"
      >
        {weekdays.map((day) => (
          <GridItem textTransform="uppercase" color="gray.400" mb="2">
            {format(day, "EEE")}
          </GridItem>
        ))}
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
    </>
  )
}
