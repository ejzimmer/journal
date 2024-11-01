import { ReactElement } from "react"
import { ItemProvider, UpdateItemContext } from "../../storage/ItemManager"
import { MockStoreProvider } from "../../storage/Store"
import { Item } from "../types"

type MockTaskProviderProps = {
  tasks?: Record<string, Item>
  children: ReactElement
  onChange?: UpdateItemContext["onChange"]
  onDelete?: UpdateItemContext["onDelete"]
  onAddTask?: UpdateItemContext["onAddItem"]
}

export const TASKS = {
  "1": { id: "1", description: "Make shirt", isComplete: false },
  "11": { id: "11", description: "Buy fabric", isComplete: false },
  "12": { id: "12", description: "Prewash fabric", isComplete: false },
  "13": { id: "13", description: "Cut pattern", isComplete: false },
}

export function MockTaskProvider({
  tasks = TASKS,
  children,
}: MockTaskProviderProps) {
  return (
    <MockStoreProvider items={tasks}>
      <ItemProvider>{children}</ItemProvider>
    </MockStoreProvider>
  )
}
