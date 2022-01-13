import { useContext, useEffect } from "react"
import { FirebaseContext } from "./FirebaseContext"
import { getAuth } from "firebase/auth"

export function useStorage<T>(
  key: string,
  setData: (data: T) => void,
  data: T
) {
  const { read, write } = useContext(FirebaseContext)
  const auth = getAuth()

  useEffect(() => {
    const data = localStorage.getItem(key)
    if (data) {
      setData(JSON.parse(data))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (auth.currentUser) {
      read(key, setData)
    }
  }, [auth])

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data))
    write(key, data)
  }, [data, key]) // eslint-disable-line react-hooks/exhaustive-deps
}
