import {
  ref,
  set,
  onValue,
  Database,
  push,
  onChildAdded,
  onChildChanged,
} from "firebase/database"
import { createContext, useEffect, useState } from "react"
import { TodoItem } from "./TodoList/types"

type CrudFunction = (item: TodoItem) => void
interface CrudFunctions {
  onAdd: CrudFunction
  onChange: CrudFunction
}

interface ContextType {
  subscribeToList: (
    listName: string,
    { onAdd, onChange }: CrudFunctions
  ) => void
  addItemToList: (listName: string, item: TodoItem) => void
  updateItemInList: (listName: string, item: TodoItem) => void
  write: (key: string, data: any) => void
  useValue: (key: string) => { value?: any; loading: boolean }
}

const defaultContext: ContextType = {
  subscribeToList: (_listName, _updateList) => {},
  addItemToList: (_listName, _item) => {},
  updateItemInList: (_listName, _item) => {},
  useValue: (_key) => ({ loading: true }),
  write: (_key, _value) => {},
}

export const FirebaseContext = createContext(defaultContext)

export function createFirebaseContext(database: Database): ContextType {
  return {
    subscribeToList: (listName, { onAdd, onChange }) => {
      const reference = ref(database, listName)
      onChildAdded(reference, (snapshot) =>
        onAdd({ id: snapshot.key, ...snapshot.val() })
      )
      onChildChanged(reference, (snapshot) => onChange(snapshot.val()))
    },
    addItemToList: (listName: string, item: TodoItem) => {
      const reference = ref(database, listName)
      set(push(reference), item)
    },
    updateItemInList: (listName: string, item: TodoItem) => {
      if (item.id) {
        const reference = ref(database, `${listName}/${item.id}`)
        set(reference, item)
      }
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
