import {
  ref,
  set,
  onValue,
  Database,
  push,
  remove,
  get,
  update,
} from "firebase/database"
import { createContext, useContext, useEffect, useState } from "react"

type Item = { id: string }

export type ParentCrudFunction = <T extends Item>(
  parentId: string,
  item: T,
) => void

export interface ContextType {
  addItem: <T>(parentName: string, item: Omit<T, "id">) => string | null
  updateItem: ParentCrudFunction
  deleteItem: ParentCrudFunction
  updateList: <T extends Item>(listName: string, list: T[]) => void
  setValue: <T>(path: string, value: T) => void
  useValue: <T>(key?: string) => { value?: T; loading: boolean }
  moveItemBetweenLists: <T extends { id: string; position: number }>(args: {
    movedItem: T
    sourceListId: string
    targetListId: string
    targetListItems?: T[]
  }) => void
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
      if (!item.id) {
        console.error(
          `deleteItem called with no id, refusing to delete under "${parent}"`,
          item,
        )
        return
      }
      const path = `${parent}/${item.id}`
      const reference = ref(database, path)
      get(reference)
        .then((snapshot) => {
          if (!snapshot.exists()) {
            console.error(
              `deleteItem found nothing at "${path}" - remove() will succeed without deleting anything`,
              item,
            )
          }
        })
        .catch(() => {})
      remove(reference).catch((error) => {
        console.error(`deleteItem failed for "${path}"`, error)
      })
    },
    updateList: <T extends { id: string }>(listName: string, list: T[]) => {
      const map = list.reduce(
        (items, item) => {
          items[item.id] = item
          return items
        },
        {} as Record<string, T>,
      )
      set(ref(database, listName), map)
    },
    setValue: (path, value) => {
      set(ref(database, path), value)
    },
    moveItemBetweenLists: ({
      movedItem,
      sourceListId,
      targetListId,
      targetListItems = [],
    }) => {
      const updates: Record<string, unknown> = {
        [`${targetListId}/${movedItem.id}`]: movedItem,
        [`${sourceListId}/${movedItem.id}`]: null,
      }
      targetListItems.forEach((existingItem) => {
        updates[`${targetListId}/${existingItem.id}/position`] =
          existingItem.position < movedItem.position
            ? existingItem.position
            : existingItem.position + 1
      })
      update(ref(database), updates).catch((error) => {
        console.error("moveItemBetweenLists failed", updates, error)
      })
    },
    useValue: (key?: string) => {
      const [result, setResult] = useState<any>({ loading: true })

      useEffect(() => {
        if (!key) return

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

export function useStorageContext(): ContextType {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("Storage context not found")
  }

  return context
}
