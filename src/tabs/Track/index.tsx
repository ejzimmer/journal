import { Table, Tbody } from "@chakra-ui/react"
import { eachDayOfInterval, endOfISOWeek, startOfISOWeek } from "date-fns"
import { useContext } from "react"
import { Footer } from "./Footer"
import { Habit } from "./Track"
import { Header } from "./Header"
import { HabitRecord } from "./types"
import { FirebaseContext } from "../../shared/FirebaseContext"

const TRACK_KEY = "track"

export function Track() {
  const { useValue, write } = useContext(FirebaseContext)

  const { value: habits } = useValue(TRACK_KEY)

  const startDate = startOfISOWeek(new Date())
  const endOfWeek = endOfISOWeek(startDate)
  const days = eachDayOfInterval({ start: startDate, end: endOfWeek })

  const addHabit = (habitName: string) => {
    if (habitName) {
      write(TRACK_KEY, [...habits, { name: habitName, days: [] }])
    }
  }

  const updateHabit = (habit: HabitRecord) => {
    const index = habits.findIndex((h: HabitRecord) => h.name === habit.name)
    const startOfList = habits.slice(0, index)
    const endOfList = habits.slice(index + 1)

    write(TRACK_KEY, [...startOfList, habit, ...endOfList])
  }

  const deleteHabit = ({ name }: HabitRecord) => {
    write(TRACK_KEY, (habits: HabitRecord[]) =>
      habits.filter((habit) => habit.name !== name)
    )
  }

  return (
    <>
      <Table size="sm" width="max-content">
        <Header days={days} />
        <Tbody>
          {habits &&
            habits.map((habit: HabitRecord) => (
              <Habit
                key={habit.name}
                habit={habit}
                days={days}
                onChange={updateHabit}
                onDelete={deleteHabit}
              />
            ))}
        </Tbody>
        <Footer addHabit={addHabit} />
      </Table>
    </>
  )
}
