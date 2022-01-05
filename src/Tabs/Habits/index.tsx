import { Table, Tbody } from "@chakra-ui/react"
import { eachDayOfInterval, endOfISOWeek, startOfISOWeek } from "date-fns"
import { useEffect, useState } from "react"
import { AddHabitFooter } from "./Footer"
import { Habit } from "./Habit"
import { Header } from "./Header"
import { HabitRecord } from "./types"

const LOCAL_STORAGE_KEY = "habits"

export function Habits() {
  const [habits, setHabits] = useState<HabitRecord[]>([])

  useEffect(() => {
    const habits = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (habits) {
      setHabits(
        JSON.parse(habits).map((habit: HabitRecord) => ({
          ...habit,
          days: habit.days.map((day) => new Date(day)),
        }))
      )
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(habits))
  }, [habits])

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
        <AddHabitFooter addHabit={addHabit} />
      </Table>
    </>
  )
}
