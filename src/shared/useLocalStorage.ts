import { useEffect } from "react"

export function useLocalStorage<T>(
  key: string,
  setData: (data: T) => void,
  data: T
) {
  useEffect(() => {
    const data = localStorage.getItem(key)
    if (data) {
      setData(JSON.parse(data))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data))
  }, [data])
}
