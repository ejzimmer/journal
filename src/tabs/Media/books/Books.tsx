import { AddBookForm } from "./AddBookForm"
import { BOOKS_KEY, ReadingItemDetails } from "../types"
import { getComponent } from "./utils"
import React from "react"
import { useStorageContext } from "../../../shared/FirebaseContext"

export function Books() {
  const { useValue } = useStorageContext()

  const { value } = useValue<Record<string, ReadingItemDetails>>(BOOKS_KEY)
  const items = value ? Object.values(value) : []

  return (
    <div className="books">
      <h2>Books</h2>
      <ul>
        {items.map((item) => (
          <React.Fragment key={item.id}>{getComponent(item)}</React.Fragment>
        ))}
      </ul>
      <AddBookForm />
    </div>
  )
}
