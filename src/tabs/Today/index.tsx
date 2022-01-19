import { VStack } from "@chakra-ui/layout"
import { isSameDay, isWeekend } from "date-fns"
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

const TODAY = new Date()

export function Today() {
  const [items, setItems] = useState<TodoItem[]>([])
  const { subscribeToList, updateItemInList, deleteItemFromList, updateList } =
    useContext(FirebaseContext)

  if (items.length === 0) {
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
      onDelete: onDeleteItem,
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

          if (item.done && !isSameDay(item.done, TODAY)) {
            delete item.done
          }

          return updateInPlace(items, index, item)
        })
      } else {
        if (!item.done || isSameDay(item.done, TODAY))
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

  const onDeleteItem = useCallback(
    (item: TodoItem) => {
      setItems((items) => items.filter((i) => i.id === item.id))
    },
    [setItems]
  )

  return (
    <VStack spacing="4">
      <TodoList
        id="today"
        items={items}
        onChangeItem={(item) => updateItemInList(TODAY_KEY, item)}
        onDeleteItem={(item) => deleteItemFromList(TODAY_KEY, item)}
        onReorder={(list) => updateList(TODAY_KEY, list)}
      />
      <NewItem list={TODAY_KEY} />
    </VStack>
  )
}
