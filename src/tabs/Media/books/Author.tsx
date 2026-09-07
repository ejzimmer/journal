import { Fragment } from "react"
import { AuthorDetails, MediaList } from "../types"
import { EditableText } from "../../../shared/controls/EditableText"
import { getComponent } from "./utils"
import { Book } from "./Book"
import { Series } from "./Series"
import { useMediaStorage } from "../MediaStorageContext"

const BOOKS: MediaList = { root: "books" }

export function Author({ author }: { author: AuthorDetails }) {
  const { updateItem } = useMediaStorage()

  const items = author.items ? Object.values(author.items) : []
  const list: MediaList = {
    root: "books",
    author: { id: author.id, name: author.name },
  }

  const updateAuthorName = (name: string) => {
    updateItem(BOOKS, { ...author, name })
  }
  const asAuthorOfSingleItem = {
    name: author.name,
    onChange: updateAuthorName,
  }

  if (items.length === 0) {
    return null
  }

  if (items.length === 1 && items[0].type === "book") {
    return <Book book={items[0]} list={list} author={asAuthorOfSingleItem} />
  }

  if (items.length === 1 && items[0].type === "series") {
    return (
      <Series series={items[0]} list={list} author={asAuthorOfSingleItem} />
    )
  }

  return (
    <li className="author">
      <div>
        <EditableText
          label="author name"
          value={author.name}
          onChange={updateAuthorName}
        />
      </div>
      <ul>
        {items.map((item) => (
          <Fragment key={item.id}>{getComponent(item, list)}</Fragment>
        ))}
      </ul>
    </li>
  )
}
