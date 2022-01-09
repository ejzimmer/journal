import { VStack } from "@chakra-ui/layout"
import { isWeekend } from "date-fns"
import { useState } from "react"
import { NewItem } from "../../shared/TodoList/NewItem"
import { TodoList } from "../../shared/TodoList/TodoList"
import { TodoItem } from "../../shared/TodoList/types"
import { useStorage } from "../../shared/useLocalStorage"

const everydayThings: string[] = ["laundry", "kitchen"]
const weekdayThings: string[] = ["timesheets"]

const STORAGE_KEY = "everyday"

export function Today() {
  const [everydayItems, setEverydayItems] = useState<TodoItem[]>([])
  const [todayItems, setTodayItems] = useState<TodoItem[]>([])

  useStorage("today", setTodayItems, todayItems)
  useStorage("everyday", setEverydayItems, everydayItems)

  const todayThings = everydayThings
  if (!isWeekend(new Date())) {
    todayThings.push(...weekdayThings)
  }
  const everydayItemsForToday = everydayThings.map((thing) => {
    const item = everydayItems.find((i) => i.description === thing)

    return item || { description: thing, type: "毎日" }
  })

  const items = [...everydayItemsForToday, ...todayItems]

  const onChange = (items: TodoItem[]) => {
    const everydayItems = items.filter((item) => item.type === "毎日")
    setEverydayItems(everydayItems)

    const todayItems = items.filter((item) => item.type !== "毎日")
    setTodayItems(todayItems)
  }

  const addItem = (item: TodoItem) => {
    setTodayItems((items) => [...items, item])
  }

  return (
    <VStack spacing="4">
      <TodoList id="today" items={items} onChange={onChange} />{" "}
      <NewItem addItem={addItem} />
    </VStack>
  )
}
