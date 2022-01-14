import { ref, set, onValue, Database } from "firebase/database"
import { createContext, useEffect, useState } from "react"

interface ContextType {
  write: (key: string, data: any) => void
  useValue: (key: string) => { value?: any; loading: boolean }
}

const defaultContext: ContextType = {
  useValue: (_key: string) => ({ loading: true }),
  write: (_key: string, _value: any) => {},
}

export const FirebaseContext = createContext(defaultContext)

export function createFirebaseContext(database: Database): ContextType {
  return {
    write: (key: string, data: any) => {
      set(ref(database, key), data)
    },
    useValue: (key: string) => {
      const [result, setResult] = useState<any>({ loading: true })

      useEffect(() => {
        const reference = ref(database, key)
        onValue(reference, (snapshot) => {
          setResult({ value: snapshot.val(), loading: false })
        })
      }, [key])

      return result
    },
  }
}
