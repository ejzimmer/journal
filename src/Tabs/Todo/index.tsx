import { useState } from "react"
import { NewItem } from "./NewItem"
import { Item } from "./types"

export function Todo() {
  const [items, setItems] = useState<Item[]>([])

  const addItem = (item: Item) => {
    setItems((items) => [...items, item])
  }

  return (
    <>
      <ul>
        {items.map(({ description, type }) => (
          <li key={description}>
            {description} {type}
          </li>
        ))}
      </ul>
      <NewItem addItem={addItem} />
    </>
  )
}
