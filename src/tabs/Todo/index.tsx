import { VStack } from "@chakra-ui/layout"
import { isSameDay } from "date-fns"
import { useCallback, useContext, useEffect, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { NewItem } from "../../shared/TodoList/NewItem"
import { TodoList } from "../../shared/TodoList/TodoList"
import { TodoItem } from "../../shared/TodoList/types"

const TODO_KEY = "todo"

const TODAY = new Date()

export function Todo() {
  const [items, setItems] = useState<Record<string, TodoItem>>({})
  const { subscribeToList, updateItemInList, deleteItemFromList } =
    useContext(FirebaseContext)

  const onNewItem = useCallback(
    (item: any) => {
      if (item.done && isSameDay(item.done, TODAY)) {
        deleteItemFromList(TODO_KEY, item)
      } else {
        setItems((items) => {
          if (typeof item.position === "undefined") {
            item.position = Object.keys(items).length
            updateItemInList(TODO_KEY, item)
          }
          return { ...items, [item.id]: item }
        })
      }
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
      setItems(
        list.reduce(
          (items, item) => ({
            ...items,
            [item.id]: item,
          }),
          {}
        )
      )
      list.forEach((item) => updateItemInList(TODO_KEY, item))
    },
    [setItems, updateItemInList]
  )

  useEffect(() => {
    subscribeToList(TODO_KEY, {
      onAdd: onNewItem,
      onChange: onChangeItem,
      onDelete: onDeleteItem,
    })
  }, [onNewItem, onChangeItem, onDeleteItem, setItems, subscribeToList])

  return (
    <VStack spacing="4">
      <TodoList
        id="todo"
        items={Object.values(items)}
        onChangeItem={(item) => updateItemInList(TODO_KEY, item)}
        onDeleteItem={(item) => deleteItemFromList(TODO_KEY, item)}
        onReorder={onReorder}
      />
      <NewItem list={TODO_KEY} />
    </VStack>
  )
}
