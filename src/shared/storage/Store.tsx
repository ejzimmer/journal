import { createContext, ReactNode, useCallback, useState } from "react"
import { Item } from "../TaskList/types"
import { getNextId } from "./utils"

type Store = {
  getItem: (id: string) => Promise<Item>
  addItem: (description: string) => Promise<Item>
  updateItem: (item: Item) => void
  deleteItem: (id: string) => void
}

export const StoreContext = createContext<Store>({
  getItem: () => Promise.reject(),
  addItem: () => Promise.reject(),
  updateItem: () => undefined,
  deleteItem: () => undefined,
})

export const ITEMS: Record<string, Item> = {}
export function MockStoreProvider({
  initialItems = ITEMS,
  children,
}: {
  initialItems: Record<string, Item>
  children: ReactNode
}) {
  const [items, setItems] = useState(initialItems)
  const getItem = useCallback(
    (id: string) => {
      return items[id]
        ? Promise.resolve(items[id])
        : Promise.reject(`Could not find item ${id}`)
    },
    [items]
  )

  const addItem = useCallback(
    (description: string) => {
      const id = getNextId()
      const newItem: Item = {
        id,
        description,
        status: "not_started",
        lastUpdated: Date.now(),
      }
      setItems({ ...items, [id]: newItem })

      return Promise.resolve(newItem)
    },
    [items]
  )

  const updateItem = useCallback(
    (item: Item) => {
      console.log("updating item", item)
      setItems({ ...items, [item.id]: item })
    },
    [items]
  )

  const deleteItem = useCallback(
    (id: string) => {
      delete items[id]
      setItems({ ...items })
    },
    [items]
  )

  return (
    <StoreContext.Provider value={{ getItem, addItem, updateItem, deleteItem }}>
      {children}
    </StoreContext.Provider>
  )
}
