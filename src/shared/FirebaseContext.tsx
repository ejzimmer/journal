import {
  ref,
  set,
  onValue,
  Database,
  push,
  onChildAdded,
} from "firebase/database"
import { createContext, useEffect, useState } from "react"
import { TodoItem } from "./TodoList/types"

interface ContextType {
  subscribeToList: (
    listName: string,
    { onAdd }: { onAdd: (item: TodoItem) => void }
  ) => void
  addItemToList: (listName: string, item: any) => void
  write: (key: string, data: any) => void
  useValue: (key: string) => { value?: any; loading: boolean }
}

const defaultContext: ContextType = {
  subscribeToList: (_listName, _updateList) => {},
  addItemToList: (_listName, _item) => {},
  useValue: (_key) => ({ loading: true }),
  write: (_key, _value) => {},
}

export const FirebaseContext = createContext(defaultContext)

export function createFirebaseContext(database: Database): ContextType {
  return {
    subscribeToList: (listName, { onAdd }) => {
      const reference = ref(database, listName)
      onChildAdded(reference, (snapshot) =>
        onAdd({ id: snapshot.key, ...snapshot.val() })
      )
    },
    addItemToList: (listName: string, item: any) => {
      const reference = ref(database, listName)
      set(push(reference), item)
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
