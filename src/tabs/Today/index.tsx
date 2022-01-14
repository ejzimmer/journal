import { VStack } from "@chakra-ui/layout"
import { isSameDay, isWeekend } from "date-fns"
import { useContext, useEffect } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { NewItem } from "../../shared/TodoList/NewItem"
import { TodoList } from "../../shared/TodoList/TodoList"
import { TodoItem } from "../../shared/TodoList/types"

const everydayThings: string[] = [
  "personal hygiene",
  "laundry",
  "kitchen",
  "tidy house",
  "Duolingo",
  "Anki",
  "Bunpro",
  "Wanikani",
]
const weekdayThings: string[] = ["work", "timesheets", "stand-up @ 0930"]

const TODAY_KEY = "today"

// move items between todo and today
// have recurring items that aren't every day
// add things automatically so there's one of each type from todo in today

export function Today() {
  const { useValue, write } = useContext(FirebaseContext)

  const { value: storedItems, loading } = useValue(TODAY_KEY)

  useEffect(() => {
    if (loading) return

    const TODAY = new Date()

    const forToday = [...everydayThings]
    if (!isWeekend(TODAY)) {
      forToday.push(...weekdayThings)
    }

    const everydayItemsForToday = forToday.map((thing) => {
      const item: TodoItem =
        storedItems &&
        storedItems.find((i: TodoItem) => i.description === thing)

      if (item && item.done && !isSameDay(TODAY, new Date(item.done))) {
        delete item.done
      }

      return item || { description: thing, type: "毎日" }
    })

    const otherItemsForToday = storedItems
      ? storedItems.filter((item: TodoItem) => {
          if (item.type === "毎日") return false
          if (item.done && !isSameDay(TODAY, item.done)) return false

          return true
        })
      : []

    const itemsForToday = [...everydayItemsForToday, ...otherItemsForToday]

    function shouldUpdate(itemsForToday: TodoItem[], storedItems: TodoItem[]) {
      if (!storedItems) return true
      if (itemsForToday.length !== storedItems.length) return true

      return itemsForToday.some((item, index) => {
        const storedItem = storedItems[index]

        return (
          storedItem.description !== item.description ||
          storedItem.done !== item.done
        )
      })
    }

    if (shouldUpdate(itemsForToday, storedItems)) {
      write(TODAY_KEY, itemsForToday)
    }
  }, [storedItems, loading, write])

  const onChange = (items: TodoItem[]) => {
    write(TODAY_KEY, items)
  }
  const addItem = (item: TodoItem) => write(TODAY_KEY, [...storedItems, item])

  if (!storedItems) return <div>loading...</div>

  return (
    <VStack spacing="4">
      <TodoList id="today" items={storedItems} onChange={onChange} />{" "}
      <NewItem addItem={addItem} />
    </VStack>
  )
}
