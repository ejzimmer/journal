import { ITEMS } from "./Store"

export const getNextId = (): string => {
  const lastKey = Object.keys(ITEMS)
    .map((key) => Number.parseInt(key))
    .sort()
    .at(-1)

  return lastKey ? `${lastKey + 1}` : "0"
}
