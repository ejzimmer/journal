import { Fragment } from "react"
import { AddBookForm } from "./AddBookForm"
import { BOOKS_KEY, ReadingItemDetails } from "../types"
import { Book } from "./Book"
import { Series } from "./Series"
import { useStorageContext } from "../../../shared/FirebaseContext"

function getComponent<T extends ReadingItemDetails>(item: T) {
  switch (item.type) {
    case "book":
      return <Book book={item} path={BOOKS_KEY} />
    case "series":
      return <Series series={item} path={BOOKS_KEY} />
  }
}

export function Books() {
  const { useValue } = useStorageContext()

  const { value } = useValue<Record<string, ReadingItemDetails>>(BOOKS_KEY)
  const items = value ? Object.values(value) : []

  return (
    <div className="books">
      <h2>Books</h2>
      <ul>
        {items.map((item) => (
          <Fragment key={item.id}>{getComponent(item)}</Fragment>
        ))}
      </ul>
      <AddBookForm />
    </div>
  )
}
