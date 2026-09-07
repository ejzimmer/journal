import { Fragment } from "react"
import { AddBookForm } from "./AddBookForm"
import { getComponent } from "./utils"
import { useMediaStorage } from "../MediaStorageContext"

export function Books() {
  const { books } = useMediaStorage()
  const items = Object.values(books ?? {})

  return (
    <div className="books">
      <h2>Books</h2>
      <ul>
        {items.map((item) => (
          <Fragment key={item.id}>
            {getComponent(item, { root: "books" })}
          </Fragment>
        ))}
      </ul>
      <AddBookForm />
    </div>
  )
}
