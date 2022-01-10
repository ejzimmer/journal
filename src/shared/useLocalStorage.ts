import { useContext, useEffect } from "react"
import { FirebaseContext } from "./FirebaseContext"

export function useStorage<T>(
  key: string,
  setData: (data: T) => void,
  data: T
) {
  const { read, write } = useContext(FirebaseContext)

  useEffect(() => {
    const data = localStorage.getItem(key)
    if (data) {
      setData(JSON.parse(data))
    }
    read(key, setData)
  }, []) //eslint-ignore react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data))
    write(key, data)
  }, [data, key])
}
