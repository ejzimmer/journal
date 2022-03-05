import { VStack } from "@chakra-ui/layout"
import { isSameDay, isWeekend } from "date-fns"
import { useCallback, useContext, useEffect, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { NewItem } from "../../shared/TodoList/NewItem"
import { TodoList } from "../../shared/TodoList/TodoList"
import { TodoItem } from "../../shared/TodoList/types"
import { isDailyTask } from "../../shared/utilities"

const TODAY_KEY = "today"

// move items between todo and today
// have recurring items that aren't every day
// add things automatically so there's one of each type from todo in today

const TODAY = new Date()

export function Today() {
  const [items, setItems] = useState<Record<string, TodoItem>>({})
  const [hiddenItems, setHiddenItems] = useState<TodoItem[]>([])
  const { subscribeToList, updateItemInList, deleteItemFromList, updateList } =
    useContext(FirebaseContext)

  const onNewItem = useCallback(
    (item: TodoItem) => {
      if (
        (item.frequency === "平日" || item.type === "⚒️") &&
        isWeekend(TODAY)
      ) {
        setHiddenItems((items) => [...items, item])
        return
      }

      if (!isDailyTask(item) && !!item.done && !isSameDay(item.done, TODAY)) {
        deleteItemFromList(TODAY_KEY, item)
        return
      }

      if (isDailyTask(item) && item.done && !isSameDay(item.done, TODAY)) {
        delete item.done
        updateItemInList(TODAY_KEY, item)
      }

      setItems((items) => {
        if (typeof item.position !== "number") {
          item.position = Object.keys(items).length
          updateItemInList(TODAY_KEY, item)
        }

        return {
          ...items,
          [item.id]: item,
        }
      })
    },
    [setItems, deleteItemFromList, updateItemInList]
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
      updateList(TODAY_KEY, [...list, ...hiddenItems])
    },
    [updateList]
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
      <NewItem list={TODAY_KEY} showFrequency={true} />
    </VStack>
  )
}
