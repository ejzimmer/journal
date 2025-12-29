import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { AddBookForm } from "./AddBookForm"
import { ItemDetails, KEY } from "./types"
import { Book } from "./Book"
import { Author } from "./Author"
import { Series } from "./Series"

function getComponent<T extends ItemDetails>(item: T) {
  switch (item.type) {
    case "book":
      return <Book book={item} path={KEY} />
    case "author":
      return <Author author={item} />
    case "series":
      return <Series series={item} path={KEY} />
  }
}

export function Books() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const { value } = storageContext.useValue<ItemDetails>(KEY)
  const items = value ? Object.values(value) : []

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h2>Books</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{getComponent(item)}</li>
        ))}
      </ul>
      <AddBookForm />
    </div>
  )
}
