import { isSameDay, isWeekend } from "date-fns"
import { useEffect, useState } from "react"
import { TodoList } from "../../shared/TodoList/TodoList"
import { TodoItem } from "../../shared/TodoList/types"

const everydayThings: string[] = ["laundry", "kitchen"]
const weekdayThings: string[] = ["timesheets"]

const STORAGE_KEY = "everyday"

interface EverydayThing {
  description: string
  lastDone: string
}

export function Today() {
  const data = localStorage.getItem(STORAGE_KEY) || "[]"
  const storedItems = JSON.parse(data) as EverydayThing[]

  const [todayItems, setTodayItems] = useState<TodoItem[]>([])

  useEffect(() => {
    const todayThings = everydayThings
    if (!isWeekend(new Date())) todayThings.push(...weekdayThings)

    const items = everydayThings.map((thing) => {
      const storedThing = storedItems.find((s) => s.description === thing)
      const done = !!(
        storedThing &&
        storedThing.lastDone &&
        isSameDay(new Date(storedThing.lastDone), new Date())
      )

      return {
        description: thing,
        type: "毎日",
        done,
      }
    })

    setTodayItems(items)
  }, [])

  const onChange = (items: TodoItem[]) => {
    const todayItems = items.map((item) => ({
      description: item.description,
      lastDone: item.done ? new Date() : undefined,
    }))

    localStorage.setItem(STORAGE_KEY, JSON.stringify(todayItems))

    setTodayItems(items)
  }

  return <TodoList id="today" items={todayItems} onChange={onChange} />
}
