import { VStack } from "@chakra-ui/layout"
import { isSameDay } from "date-fns"
import { useCallback, useContext, useEffect, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { NewItem } from "../../shared/TodoList/NewItem"
import { TodoList } from "../../shared/TodoList/TodoList"
import { TodoItem } from "../../shared/TodoList/types"
import { updateInPlace } from "../../shared/utils"

const TODO_KEY = "todo"

const TODAY = new Date()

export function Todo() {
  const [items, setItems] = useState<TodoItem[]>([])
  const { subscribeToList, updateItemInList, deleteItemFromList, updateList } =
    useContext(FirebaseContext)

  const onNewItem = useCallback(
    (item: TodoItem) => {
      if (!item.done || isSameDay(item.done, TODAY)) {
        setItems((items) => [...items, item])
      }
    },
    [setItems]
  )

  const onChangeItem = useCallback(
    (item: TodoItem) => {
      setItems((items) => {
        const index = items.findIndex((i) => i.id === item.id)
        return updateInPlace(items, index, item)
      })
    },
    [setItems]
  )

  const onDeleteItem = useCallback(
    (item: TodoItem) => {
      setItems((items) => items.filter((i) => i.id === item.id))
    },
    [setItems]
  )

  useEffect(() => {
    subscribeToList(TODO_KEY, {
      onAdd: onNewItem,
      onChange: onChangeItem,
      onDelete: onDeleteItem,
      replaceList: setItems,
    })
  }, [onNewItem, onChangeItem, onDeleteItem, setItems, subscribeToList])

  return (
    <VStack spacing="4">
      <TodoList
        id="today"
        items={items}
        onChangeItem={(item) => updateItemInList(TODO_KEY, item)}
        onDeleteItem={(item) => deleteItemFromList(TODO_KEY, item)}
        onReorder={(list) => updateList(TODO_KEY, list)}
      />
      <NewItem list={TODO_KEY} />
    </VStack>
  )
}
