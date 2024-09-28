import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react"
import { Item } from "../TaskList/types"
import { getDatabase, onValue, ref, remove, update } from "firebase/database"

export type ItemResponse = {
  item?: Item
  error?: Error
  isLoading: boolean
}
export type FetchItemContext = (id: string) => Promise<Item>
export const FetchItem = createContext<FetchItemContext>(() => Promise.reject())

export type UpdateItemContext = {
  onChange: (item: Item) => void
  onDelete: (id: string) => void
  onAddSubtask: (parentId: string, description: string) => void
}
export const UpdateItem = createContext<UpdateItemContext>({
  onChange: () => undefined,
  onDelete: () => undefined,
  onAddSubtask: () => undefined,
})

export function useItem(id: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [item, setItem] = useState<Item>()
  const [error, setError] = useState<Error>()

  try {
    const getItem = useContext(FetchItem)
    const { onChange, onDelete, onAddSubtask } = useContext(UpdateItem)

    if (!isLoading && !item && !error) {
      setIsLoading(true)
      getItem(id)
        .then((item) => {
          setItem(item)
        })
        .catch((error) => setError(error))
        .finally(() => {
          setIsLoading(false)
        })
    }

    return {
      isLoading,
      item,
      error,
      onChange,
      onDelete: () => onDelete(id),
      onAddSubtask: (description: string) => onAddSubtask(id, description),
    }
  } catch (e) {
    throw new Error("Missing fetch item provider")
  }
}

export function ItemProvider({ children }: { children: ReactNode }) {
  const [database] = useState(getDatabase)

  const getItem = useCallback(
    (itemId: string) => {
      const itemRef = ref(database, `items/${itemId}`)
      return new Promise<Item>((resolve, reject) => {
        onValue(itemRef, (snapshot) => {
          const data = snapshot.val()
          if (!data) {
            reject(`Unable to fetch item ${itemId}`)
          }
          resolve(data)
        })
      })
    },
    [database]
  )

  const onChange = useCallback(
    async (item: Item) => {
      const updates = {
        [`/items/${item.id}`]: item,
      }
      await update(ref(database), updates)
    },
    [database]
  )

  const onAddSubtask = useCallback(
    async (parentId: string, description: string) => {
      // create new task & get back id
      // add id to subtasks list of current task
    },
    []
  )

  const onDelete = useCallback(
    (id: string) => {
      const deleteRef = ref(database, `items/${id}`)
      return remove(deleteRef)
    },
    [database]
  )

  return (
    <FetchItem.Provider value={getItem}>
      <UpdateItem.Provider value={{ onChange, onDelete, onAddSubtask }}>
        {children}
      </UpdateItem.Provider>
    </FetchItem.Provider>
  )
}
