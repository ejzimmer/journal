import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { AddBookForm } from "./AddBookForm"
import { BOOKS_KEY, ReadingItemDetails } from "../types"
import { getComponent } from "./utils"

export function Books() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const { value } = storageContext.useValue<ReadingItemDetails>(BOOKS_KEY)
  const items = value ? Object.values(value) : []

  return (
    <div className="books">
      <h2>Books</h2>
      <ul>{items.map((item) => getComponent(item))}</ul>
      <AddBookForm />
    </div>
  )
}
