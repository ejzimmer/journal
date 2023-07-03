import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons"
import { Grid, GridItem, Heading, IconButton } from "@chakra-ui/react"
import {
  addMonths,
  format,
  getDaysInMonth,
  isToday,
  startOfMonth,
} from "date-fns"
import { useCallback, useContext, useEffect, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { getWeekdays, initialiseDay } from "../../shared/utilities"
import { Day } from "./Day"
import { Trackers } from "./types"

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

  const startDay = format(date, "i")

  const hueIncrement = 360 / Object.values(days).length

  return (
    <>
      <Grid
        margin="auto"
        alignItems="center"
        gridTemplateColumns="1fr max-content 1fr"
        width="300px"
        mb="2em"
      >
        <GridItem justifySelf="start">
          <NavButton direction={-1} setDate={setDate} />
        </GridItem>
        <Heading color="gray.700">{format(date, "MMMM")}</Heading>
        <GridItem justifySelf="end">
          <NavButton direction={1} setDate={setDate} />
        </GridItem>
      </Grid>

      <Grid
        gridTemplateColumns="repeat(7, min-content)"
        justifyContent="center"
        justifyItems="center"
      >
        {weekdays.map((day) => (
          <GridItem
            key={format(day, "EEE")}
            textTransform="uppercase"
            color="gray.400"
            mb="2"
          >
            {format(day, "EEE")}
          </GridItem>
        ))}
        {Object.entries(days)
          .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
          .map(([day, trackers], index) => (
            <GridItem key={day} gridColumn={index === 0 ? startDay : ""}>
              <Day
                day={day}
                trackers={trackers}
                mx="2px"
                my="8px"
                onChange={onChange}
                hue={hueIncrement * Number.parseInt(day, 10)}
              />
            </GridItem>
          ))}
      </Grid>
    </>
  )
}

type NavButtonProps = {
  direction: 1 | -1
  setDate: (setter: (date: Date) => Date) => void
}

function NavButton({ direction, setDate }: NavButtonProps) {
  return (
    <IconButton
      display="inline-flex"
      color="gray.300"
      _hover={{ color: "blue.500" }}
      aria-label={`${direction === 1 ? "next" : "previous"} month`}
      icon={direction === 1 ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      onClick={() => setDate((date) => addMonths(date, direction))}
      variant="unstyled"
      fontSize="40px"
    />
  )
}
