import { ref, set, onValue, Database } from "firebase/database"
import { createContext } from "react"

export const FirebaseContext = createContext({
  read: (_key: string, _setState: (value: any) => void) => {},
  write: (_key: string, _value: any) => {},
})

export function createFirebaseContext(database: Database) {
  return {
    write: (key: string, data: any) => {
      set(ref(database, key), data)
    },
    read: (key: string, setState: (value: any) => void) => {
      const reference = ref(database, key)
      onValue(reference, (snapshot) => {
        if (snapshot.val()) {
          setState(snapshot.val())
        }
      })
    },
  }
}
