import { Table, Tbody } from "@chakra-ui/react"
import { eachDayOfInterval, endOfISOWeek, startOfISOWeek } from "date-fns"
import { useState } from "react"
import { Footer } from "./Footer"
import { Habit } from "./Track"
import { Header } from "./Header"
import { HabitRecord } from "./types"
import { useLocalStorage } from "../../shared/useLocalStorage"

const LOCAL_STORAGE_KEY = "habits"

export function Track() {
  const [habits, setHabits] = useState<HabitRecord[]>([])

  const updateHabits = (habits: HabitRecord[]) => {
    const mappedHabits = habits.map((habit: HabitRecord) => ({
      ...habit,
      days: habit.days.map((day) => new Date(day)),
    }))
    setHabits(mappedHabits)
  }

  useLocalStorage(LOCAL_STORAGE_KEY, updateHabits, habits)

  const startDate = startOfISOWeek(new Date())
  const endOfWeek = endOfISOWeek(startDate)
  const days = eachDayOfInterval({ start: startDate, end: endOfWeek })

  const addHabit = (habitName: string) => {
    if (habitName) {
      setHabits((habits) => [...habits, { name: habitName, days: [] }])
    }
  }

  const updateHabit = (habit: HabitRecord) => {
    setHabits((habits) => {
      const index = habits.findIndex((h) => h.name === habit.name)
      const startOfList = habits.slice(0, index)
      const endOfList = habits.slice(index + 1)

      return [...startOfList, habit, ...endOfList]
    })
  }

  const deleteHabit = ({ name }: HabitRecord) => {
    setHabits((habits) => habits.filter((habit) => habit.name !== name))
  }

  return (
    <>
      <Table size="sm" width="max-content">
        <Header days={days} />
        <Tbody>
          {habits &&
            habits.map((habit) => (
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
