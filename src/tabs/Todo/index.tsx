import { useContext } from "react"
import { NewItem } from "../../shared/TodoList/NewItem"
import { VStack } from "@chakra-ui/react"
import { TodoList } from "../../shared/TodoList/TodoList"
import { TodoItem } from "../../shared/TodoList/types"
import { FirebaseContext } from "../../shared/FirebaseContext"

const TODO_KEY = "todo"

export function Todo() {
  const { useValue, write } = useContext(FirebaseContext)

  const { value: items, loading } = useValue(TODO_KEY)

  const addItem = (item: TodoItem) => {
    write(TODO_KEY, [...(items || []), item])
  }

  const onChange = (items: TodoItem[]) => write(TODO_KEY, items)

  if (loading) return <div>loading..</div>

  return (
    <VStack spacing="4">
      <TodoList
        id="all-todos"
        items={items || []}
        onReorder={onChange}
        onChangeItem={() => {}}
        onDeleteItem={() => {}}
      />
      <NewItem list={TODO_KEY} />
    </VStack>
  )
}
