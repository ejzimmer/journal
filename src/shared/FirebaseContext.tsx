import {
  ref,
  set,
  onValue,
  Database,
  push,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  remove,
} from "firebase/database"
import { createContext, useEffect, useState } from "react"
import { TodoItem } from "./TodoList/types"

type CrudFunction = (item: TodoItem) => void
export type ParentCrudFunction = (parentId: string, item: any) => void

interface CrudFunctions {
  onAdd: CrudFunction
  onChange: CrudFunction
  onDelete: CrudFunction
}

interface ContextType {
  subscribe: (parentName: string, { onAdd, onChange }: CrudFunctions) => void
  addItem: (parentName: string, item: any) => string | null
  updateItem: ParentCrudFunction
  deleteItem: ParentCrudFunction
  updateList: <T extends { id: string }>(listName: string, list: T[]) => void
  write: (key: string, data: any) => void
  read: (key: string, onChange: (value: any) => void) => void
  useValue: <T>(key: string) => { value?: Record<string, T>; loading: boolean }
}

export const FirebaseContext = createContext<ContextType | undefined>(undefined)

export function createFirebaseContext(database: Database): ContextType {
  return {
    subscribe: (objectName, { onAdd, onChange, onDelete }) => {
      const reference = ref(database, objectName)
      onChildAdded(reference, (snapshot) => {
        onAdd({ id: snapshot.key, ...snapshot.val() })
      })
      onChildChanged(reference, (snapshot) => onChange(snapshot.val()))
      onChildRemoved(reference, (snapshot) => onDelete(snapshot.val()))
    },
    addItem: (parent, item) => {
      const reference = ref(database, parent)
      const newItemReference = push(reference)
      set(newItemReference, {
        ...item,
        id: newItemReference.key,
        lastUpdated: new Date().getTime(),
      })
      return newItemReference.key
    },
    updateItem: (parent, item) => {
      if (item.id) {
        const reference = ref(database, `${parent}/${item.id}`)
        set(reference, { ...item, lastUpdated: new Date().getTime() })
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
    write: (key: string, data: any) => {
      set(ref(database, key), data)
    },
    read: (key: string, onChange: (value: any) => void) => {
      const reference = ref(database, key)
      onValue(reference, (snapshot) => {
        onChange(snapshot.val())
      })
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
