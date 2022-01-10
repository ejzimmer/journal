import { Auth, GoogleAuthProvider, signInWithPopup, User } from "@firebase/auth"
import { ref, set, onValue, Database } from "firebase/database"
import { createContext } from "react"

interface ContextType {
  login?: () => Promise<void>
  getUser?: () => User
  write: (key: string, data: any) => void
  read: (key: string, setState: (value: any) => void) => void
}

const defaultContext: ContextType = {
  read: (_key: string, _setState: (value: any) => void) => {},
  write: (_key: string, _value: any) => {},
}

export const FirebaseContext = createContext(defaultContext)

export function createFirebaseContext(database: Database, auth: Auth) {
  let user: User

  return {
    login: async function login() {
      const response = await signInWithPopup(auth, new GoogleAuthProvider())
      user = response.user
    },
    getUser: () => user,
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
