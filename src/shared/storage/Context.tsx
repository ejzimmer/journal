import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { Item } from "../TaskList/types"
import { getDatabase, onValue, ref, remove, update } from "firebase/database"

export type FetchItemContext = {
  item?: Item
  error?: string
}

export const FetchItem = createContext<FetchItemContext>({})

export type UpdateItemContext = {
  onChange: (item: Item) => void
  onDelete: () => void
  onAddSubtask: (description: string) => void
}
export function useFetchItem() {
  let context
  try {
    context = useContext(FetchItem)
  } catch (e) {
    throw new Error("Missing fetch item provider")
  }

  return context
}

export const UpdateItem = createContext<UpdateItemContext>({
  onChange: () => undefined,
  onDelete: () => undefined,
  onAddSubtask: () => undefined,
})
export function useUpdateItem() {
  let context
  try {
    context = useContext(UpdateItem)
  } catch (e) {
    throw new Error("Missing update item provider")
  }

  return context
}

export function ItemProvider({
  itemId,
  children,
}: {
  itemId: string
  children: ReactNode
}) {
  const [database] = useState(getDatabase)
  const [item, setItem] = useState<Item>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    const itemRef = ref(database, `items/${itemId}`)

    onValue(itemRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setError(`Unable to fetch item ${itemId}`)
      }
      setItem(data)
    })
  }, [database, itemId])

  const onChange = useCallback(
    async (item: Item) => {
      const updates = {
        [`/items/${itemId}`]: item,
      }
      await update(ref(database), updates)
    },
    [database, itemId]
  )

  const onAddSubtask = useCallback(async (description: string) => {
    // create new task & get back id
    // add id to subtasks list of current task
  }, [])

  const onDelete = useCallback(() => {
    const deleteRef = ref(database, `items/${itemId}`)
    return remove(deleteRef)
  }, [database, itemId])

  return (
    <FetchItem.Provider value={{ item, error }}>
      <UpdateItem.Provider value={{ onChange, onDelete, onAddSubtask }}>
        {children}
      </UpdateItem.Provider>
    </FetchItem.Provider>
  )
}
