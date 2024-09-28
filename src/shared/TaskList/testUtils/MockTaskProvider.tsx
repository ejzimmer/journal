import { ReactElement, ReactNode } from "react"
import { Item } from "../types"
import { FetchItem, UpdateItem } from "../../storage/Context"

export const TASKS = {
  "1": { id: "1", description: "Make shirt", isComplete: false },
  "11": { id: "11", description: "Buy fabric", isComplete: false },
  "12": { id: "12", description: "Prewash fabric", isComplete: false },
  "13": { id: "13", description: "Cut pattern", isComplete: false },
}
const isValidTask = (id: string): id is keyof typeof TASKS => id in TASKS

type MockTaskProviderProps = {
  isLoading?: boolean
  error?: Error
  item?: Item
  onChange?: (item: Item) => void
  onDelete?: (id: string) => void
  onAddTask?: (description: string, parentId: string) => void
  children: ReactElement
}

export function MockTaskProvider({
  isLoading,
  error,
  item,
  children,
  onChange,
  onDelete,
  onAddTask,
}: MockTaskProviderProps) {
  const getItem = (id: string) => {
    if (isLoading) {
      return new Promise<Item>(() => undefined)
    }
    if (error) {
      return Promise.reject(error)
    }

    if (item && item.id === id) {
      return Promise.resolve(item)
    }

    return isValidTask(id)
      ? Promise.resolve(TASKS[id])
      : Promise.reject("item not found")
  }
  return (
    <FetchItem.Provider value={getItem}>
      <UpdateItem.Provider
        value={{
          onChange: onChange ?? jest.fn(),
          onDelete: onDelete ?? jest.fn(),
          onAddTask: onAddTask ?? jest.fn(),
        }}
      >
        {children}
      </UpdateItem.Provider>
    </FetchItem.Provider>
  )
}
