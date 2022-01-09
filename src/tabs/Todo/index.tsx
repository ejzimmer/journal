import { useState } from "react"
import { NewItem } from "../../shared/TodoList/NewItem"
import { VStack } from "@chakra-ui/react"
import { TodoList } from "../../shared/TodoList/TodoList"
import { TodoItem } from "../../shared/TodoList/types"
import { useStorage } from "../../shared/useLocalStorage"

const LOCAL_STORAGE_KEY = "todo"

export function Todo() {
  const [items, setItems] = useState<TodoItem[]>([])

  useStorage(LOCAL_STORAGE_KEY, setItems, items)

  const addItem = (item: TodoItem) => {
    setItems((items) => [...items, item])
  }

  const onChange = (items: TodoItem[]) => setItems(items)

  return (
    <VStack spacing="4">
      <TodoList id="all-todos" items={items} onChange={onChange} />
      <NewItem addItem={addItem} />
    </VStack>
  )
}
