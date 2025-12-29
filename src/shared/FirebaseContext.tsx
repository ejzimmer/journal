import { ref, set, onValue, Database, push, remove } from "firebase/database"
import { createContext, useEffect, useState } from "react"

type Item = { id: string }

export type ParentCrudFunction = <T extends Item>(
  parentId: string,
  item: T
) => void

interface ContextType {
  addItem: <T>(parentName: string, item: Omit<T, "id">) => string | null
  updateItem: ParentCrudFunction
  deleteItem: ParentCrudFunction
  updateList: <T extends Item>(listName: string, list: T[]) => void
  useValue: <T>(key: string) => { value?: Record<string, T>; loading: boolean }
}

export const FirebaseContext = createContext<ContextType | undefined>(undefined)

export function createFirebaseContext(database: Database): ContextType {
  return {
    addItem: (parent, item) => {
      const reference = ref(database, parent)
      const newItemReference = push(reference)
      set(newItemReference, {
        ...item,
        id: newItemReference.key,
      })
      return newItemReference.key
    },
    updateItem: (parent, item) => {
      if (item.id) {
        const reference = ref(database, `${parent}/${item.id}`)
        set(reference, item)
      } else {
        const reference = ref(database, parent)
        set(reference, item)
      }
    },
    deleteItem: (parent, item) => {
      const reference = ref(database, `${parent}/${item.id}`)
      remove(reference)
    },
    updateList: <T extends { id: string }>(listName: string, list: T[]) => {
      const map = list.reduce((items, item) => {
        items[item.id] = item
        return items
      }, {} as Record<string, T>)
      set(ref(database, listName), map)
    },
    useValue: (key: string) => {
      const [result, setResult] = useState<any>({ loading: true })

      useEffect(() => {
        const reference = ref(database, key)

        onValue(reference, (snapshot) => {
          if (snapshot.val())
            setResult({ value: snapshot.val(), loading: false })
          else setResult({ loading: false })
        })
      }, [key])

      return result
    },
  }
}
