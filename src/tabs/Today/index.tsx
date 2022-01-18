import { VStack } from "@chakra-ui/layout"
import { isWeekend } from "date-fns"
import { useCallback, useContext, useEffect, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { NewItem } from "../../shared/TodoList/NewItem"
import { TodoList } from "../../shared/TodoList/TodoList"
import { TodoItem } from "../../shared/TodoList/types"
import { updateInPlace } from "../../shared/utils"

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

// create list of every day things
// as each item arrives
// if it's an everyday thing, update the everyday list. if it was done yesterday, update the item to not done
// otherwise, if it was done yesterday, delete it, otherwise add it to the list
// need to change context from useList(TODAY_KEY, setStateFunction) to useList(TODAY_KEY, (item) => void)

export function Today() {
  const [items, setItems] = useState<TodoItem[]>([])
  const { subscribeToList, updateItemInList, updateList } =
    useContext(FirebaseContext)

  if (items.length === 0) {
    const TODAY = new Date()

    const forToday = [...everydayThings]
    if (!isWeekend(TODAY)) {
      forToday.push(...weekdayThings)
    }

    const items = forToday.map((item) => ({ description: item, type: "毎日" }))
    setItems(items)
  }

  useEffect(() => {
    subscribeToList(TODAY_KEY, {
      onAdd: onNewItem,
      onChange: onChangeItem,
      replaceList: setItems,
    })
  }, [])

  const onNewItem = useCallback(
    (item: TodoItem) => {
      if (item.type === "毎日") {
        setItems((items) => {
          const index = items.findIndex((i) =>
            typeof i.id === "undefined"
              ? i.description === item.description
              : i.id === item.id
          )

          return updateInPlace(items, index, item)
        })
      } else {
        setItems((items) => [...items, item])
      }
    },
    [items, setItems]
  )

  const onChangeItem = useCallback(
    (item: TodoItem) => {
      setItems((items) => {
        const index = items.findIndex((i) => i.id === item.id)
        return updateInPlace(items, index, item)
      })
    },
    [items, setItems]
  )

  // const [storedItems, setStoredItems] = useState([])
  // const { useList, write } = useContext(FirebaseContext)

  // useList(TODAY_KEY, setStoredItems)

  // useEffect(() => {
  //   const TODAY = new Date()

  //   const forToday = [...everydayThings]
  //   if (!isWeekend(TODAY)) {
  //     forToday.push(...weekdayThings)
  //   }

  //   const everydayItemsForToday = forToday.map((thing) => {
  //     const item: TodoItem | undefined =
  //       storedItems &&
  //       storedItems.find((i: TodoItem) => i.description === thing)

  //     if (item) {
  //       const theItem = item as TodoItem
  //       if (theItem.done && !isSameDay(TODAY, new Date(theItem.done))) {
  //         delete (item as TodoItem).done
  //       }
  //     }

  //     return item || { description: thing, type: "毎日" }
  //   })

  //   const otherItemsForToday = storedItems
  //     ? storedItems.filter((item: TodoItem) => {
  //         if (item.type === "毎日") return false
  //         if (item.done && !isSameDay(TODAY, item.done)) return false

  //         return true
  //       })
  //     : []

  //   const itemsForToday = [...everydayItemsForToday, ...otherItemsForToday]

  //   function shouldUpdate(itemsForToday: TodoItem[], storedItems: TodoItem[]) {
  //     if (!storedItems) return true
  //     if (itemsForToday.length !== storedItems.length) return true

  //     return itemsForToday.some((item, index) => {
  //       const storedItem = storedItems[index]

  //       return (
  //         storedItem.description !== item.description ||
  //         storedItem.done !== item.done
  //       )
  //     })
  //   }

  //   // if (shouldUpdate(itemsForToday, storedItems)) {
  //   //   write(TODAY_KEY, itemsForToday)
  //   // }
  // }, [storedItems])

  // const onChange = (items: TodoItem[]) => {
  //   write(TODAY_KEY, items)
  // }

  // if (!storedItems) return <div>loading...</div>

  return (
    <VStack spacing="4">
      <TodoList
        id="today"
        items={items}
        onChangeItem={(item) => updateItemInList(TODAY_KEY, item)}
        onReorder={(list) => updateList(TODAY_KEY, list)}
      />
      <NewItem list={TODAY_KEY} />
    </VStack>
  )
}
