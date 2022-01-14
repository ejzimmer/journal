import { User } from "@firebase/auth"
import { ref, set, onValue, Database } from "firebase/database"
import { createContext, useEffect, useState } from "react"

interface ContextType {
  write: (key: string, data: any) => void
  useValue: (key: string) => { value?: any }
}

const defaultContext: ContextType = {
  useValue: (_key: string) => ({}),
  write: (_key: string, _value: any) => {},
}

export const FirebaseContext = createContext(defaultContext)

export function createFirebaseContext(database: Database): ContextType {
  return {
    write: (key: string, data: any) => {
      set(ref(database, key), data)
    },
    useValue: (key: string) => {
      const [value, setValue] = useState<any>()

      useEffect(() => {
        const reference = ref(database, key)
        onValue(reference, (snapshot) => {
          setValue(snapshot.val())
        })
      }, [])

      return { value }
    },
  }
}
