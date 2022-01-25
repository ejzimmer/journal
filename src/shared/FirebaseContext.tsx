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
type ListCrudFunction = (listName: string, item: Partial<TodoItem>) => void

interface CrudFunctions {
  onAdd: CrudFunction
  onChange: CrudFunction
  onDelete: CrudFunction
}

interface ContextType {
  subscribeToList: (
    listName: string,
    { onAdd, onChange }: CrudFunctions
  ) => void
  addItemToList: ListCrudFunction
  updateItemInList: ListCrudFunction
  deleteItemFromList: ListCrudFunction
  updateList: (listName: string, list: TodoItem[]) => void
  write: (key: string, data: any) => void
  useValue: (key: string) => { value?: any; loading: boolean }
}

const defaultContext: ContextType = {
  subscribeToList: (_listName, _updateList) => {},
  addItemToList: (_listName, _item) => {},
  deleteItemFromList: (_listName, _item) => {},
  updateItemInList: (_listName, _item) => {},
  updateList: (_listName, _list) => {},
  useValue: (_key) => ({ loading: true }),
  write: (_key, _value) => {},
}

export const FirebaseContext = createContext(defaultContext)

export function createFirebaseContext(database: Database): ContextType {
  return {
    subscribeToList: (listName, { onAdd, onChange, onDelete }) => {
      const reference = ref(database, listName)
      onChildAdded(reference, (snapshot) => {
        onAdd({ id: snapshot.key, ...snapshot.val() })
      })
      onChildChanged(reference, (snapshot) => onChange(snapshot.val()))
      onChildRemoved(reference, (snapshot) => onDelete(snapshot.val()))
    },
    addItemToList: (listName, item) => {
      const reference = ref(database, listName)
      const newItemReference = push(reference)
      set(newItemReference, { ...item, id: newItemReference.key })
    },
    updateItemInList: (listName, item) => {
      if (item.id) {
        const reference = ref(database, `${listName}/${item.id}`)
        set(reference, item)
      }
    },
    deleteItemFromList: (listName, item) => {
      const reference = ref(database, `${listName}/${item.id}`)
      remove(reference)
    },
    updateList: (listName, list) => {
      const map = list.reduce((items, item) => {
        items[item.id] = item
        return items
      }, {} as Record<string, TodoItem>)
      set(ref(database, listName), map)
    },
    write: (key: string, data: any) => {
      set(ref(database, key), data)
    },
    useValue: (key: string) => {
      const [result, setResult] = useState<any>({ loading: true })

      useEffect(() => {
        const reference = ref(database, key)
        onValue(reference, (snapshot) => {
          setResult({ value: Object.values(snapshot.val()), loading: false })
        })
      }, [key])

      return result
    },
  }
}
