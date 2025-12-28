import { isSameDay } from "date-fns"
import { useCallback, useContext, useEffect, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { NewItem } from "./TodoList/NewItem"
import { TodoList } from "./TodoList/TodoList"
import { TodoItem } from "./TodoList/types"

const TODO_KEY = "todo"

const TODAY = new Date()

export function Todo() {
  const [items, setItems] = useState<Record<string, TodoItem>>({})
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("missing firebase context")
  }
  const {
    subscribe: subscribeToList,
    updateItem: updateItemInList,
    deleteItem: deleteItemFromList,
  } = context

  const onNewItem = useCallback(
    (item: any) => {
      if (item.done && !isSameDay(item.done, TODAY)) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <TodoList
        id="todo"
        items={Object.values(items)}
        onChangeItem={(item) => updateItemInList(TODO_KEY, item)}
        onDeleteItem={(item) => deleteItemFromList(TODO_KEY, item)}
        onReorder={onReorder}
        currentList="todo"
        otherLists={["today"]}
      />
      <NewItem list={TODO_KEY} />
    </div>
  )
}
