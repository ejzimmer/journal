import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react"
import { Item } from "../TaskList/types"
import { StoreContext } from "./Store"

export type ItemResponse = {
  item?: Item
  error?: Error
  isLoading: boolean
}
export type FetchItemContext = (id: string) => Promise<Item>
export const FetchItem = createContext<FetchItemContext | undefined>(undefined)

export type UpdateItemContext = {
  onChange: (item: Item) => void
  onDelete: (id: string) => void
  onAddItem: (description: string, parentId?: string) => void
}
export const UpdateItem = createContext<UpdateItemContext | undefined>(
  undefined
)

export function useFetchItem() {
  const fetchItem = useContext(FetchItem)
  if (!fetchItem) throw new Error("Missing fetch item provider")

  return fetchItem
}

export function useUpdateItem(id: string) {
  const updateItem = useContext(UpdateItem)
  if (!updateItem) throw new Error("Missing update item provider")

  const { onChange, onDelete, onAddItem } = updateItem
  return {
    onChange,
    onDelete: () => onDelete(id),
    onAddItem: (description: string) => onAddItem(id, description),
  }
}

export function useItem(id: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [item, setItem] = useState<Item>()
  const [error, setError] = useState<Error>()

  const fetchItem = useContext(FetchItem)
  if (!fetchItem) throw new Error("Missing fetch item provider")

  const refreshItem = useCallback(async () => {
    setIsLoading(true)
    const item = await fetchItem(id)
    setItem(item)
    setIsLoading(false)
  }, [id, fetchItem])

  const { onAddItem, onChange, onDelete } = useUpdateItem(id)

  const handleChange = useCallback(
    (item: Item) => {
      onChange(item)
      setItem(item)
      refreshItem()
    },
    [refreshItem, onChange]
  )

  const handleAddItem = useCallback(
    async (description: string) => {
      onAddItem(description)
      refreshItem()
    },
    [onAddItem, refreshItem]
  )

  if (!isLoading && !item && !error) {
    setIsLoading(true)
    fetchItem(id)
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
    onChange: handleChange,
    onDelete,
    onAddItem: handleAddItem,
  }
}

export function ItemProvider({ children }: { children: ReactNode }) {
  const { getItem, addItem, updateItem, deleteItem } = useContext(StoreContext)

  const onDelete = useCallback(
    async (id: string) => {
      const item = await getItem(id)
      item.containedBy?.forEach(async (containerId) => {
        const container = await getItem(containerId)
        updateItem(container)
      })
      deleteItem(id)
    },
    [getItem, updateItem, deleteItem]
  )

  const onAddItem = useCallback(
    async (description: string, containerId?: string) => {
      console.log("adding", description, "to", containerId)
    },
    []
  )

  return (
    <FetchItem.Provider value={getItem}>
      <UpdateItem.Provider
        value={{ onChange: updateItem, onDelete, onAddItem: onAddItem }}
      >
        {children}
      </UpdateItem.Provider>
    </FetchItem.Provider>
  )
}
