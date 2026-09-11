import { Fragment } from "react"
import { AddBookForm } from "./AddBookForm"
import { ReadingItemDetails } from "../types"
import { Book } from "./Book"
import { Series } from "./Series"
import { useMediaStorage } from "../MediaStorageContext"

function getComponent<T extends ReadingItemDetails>(item: T) {
  switch (item.type) {
    case "book":
      return <Book book={item} />
    case "series":
      return <Series series={item} />
  }
}

export function Books() {
  const { books } = useMediaStorage()

  return (
    <div className="books">
      <h2>Books</h2>
      <ul>
        {books.map((item) => (
          <Fragment key={item.id}>{getComponent(item)}</Fragment>
        ))}
      </ul>
      <AddBookForm />
    </div>
  )
}
