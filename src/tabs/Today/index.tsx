import { VStack } from "@chakra-ui/layout"
import { isSameDay, isWeekend } from "date-fns"
import { useCallback, useContext, useEffect, useState } from "react"
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

const TODAY = new Date()

export function Today() {
  const [items, setItems] = useState<Record<string, TodoItem>>({})
  const { subscribeToList, updateItemInList, deleteItemFromList } =
    useContext(FirebaseContext)

  if (Object.keys(items).length === 0) {
    const forToday = [...everydayThings]
    if (!isWeekend(TODAY)) {
      forToday.push(...weekdayThings)
    }

    setItems(
      forToday.reduce((items, item, index) => {
        return {
          ...items,
          [item]: {
            description: item,
            type: "毎日",
            position: index,
          },
        }
      }, {})
    )
  }

  const onNewItem = useCallback(
    (item: TodoItem) => {
      if (item.type === "毎日") {
        setItems((items) => {
          const existingItem = items[item.description]
          if (existingItem) {
            items[item.id] = {
              ...existingItem,
              ...item,
            }

            delete items[item.description]
          }

          if (item.done && !isSameDay(item.done, TODAY)) {
            delete item.done
          }

          return items
        })
      } else if (!item.done || isSameDay(item.done, TODAY)) {
        setItems((items) => {
          if (!item.position) {
            item.position = Object.keys(items).length
          }

          return {
            ...items,
            [item.id]: item,
          }
        })
      }
    },
    [setItems]
  )

  const onChangeItem = useCallback(
    (item: TodoItem) => {
      setItems((items) => ({
        ...items,
        [item.id]: item,
      }))
    },
    [setItems]
  )

  const onDeleteItem = useCallback(
    (item: TodoItem) => {
      setItems((items) => {
        const copy = { ...items }
        delete copy[item.id]
        return copy
      })
    },
    [setItems]
  )

  const onReorder = useCallback(
    (list: TodoItem[]) => {
      setItems(
        list.reduce(
          (items, item) => ({
            ...items,
            [item.id]: item,
          }),
          {}
        )
      )
      list.forEach((item) => updateItemInList(TODAY_KEY, item))
    },
    [setItems, updateItemInList]
  )

  useEffect(() => {
    subscribeToList(TODAY_KEY, {
      onAdd: onNewItem,
      onChange: onChangeItem,
      onDelete: onDeleteItem,
    })
  }, [onNewItem, onChangeItem, onDeleteItem, setItems, subscribeToList])

  return (
    <VStack spacing="4">
      <TodoList
        id="today"
        items={Object.values(items)}
        onChangeItem={(item) => updateItemInList(TODAY_KEY, item)}
        onDeleteItem={(item) => deleteItemFromList(TODAY_KEY, item)}
        onReorder={onReorder}
      />
      <NewItem list={TODAY_KEY} />
    </VStack>
  )
}
