import { Fragment } from "react"
import { useStorageContext } from "../../../shared/FirebaseContext"
import { AuthorDetails, BOOKS_KEY } from "../types"
import { EditableText } from "../../../shared/controls/EditableText"
import { getComponent } from "./utils"
import { Book } from "./Book"
import { Series } from "./Series"

export function Author({ author }: { author: AuthorDetails }) {
  const { updateItem } = useStorageContext()

  const path = `${BOOKS_KEY}/${author.id}/items`
  const items = author.items ? Object.values(author.items) : undefined

  const updateAuthorName = (name: string) => {
    updateItem<AuthorDetails>(BOOKS_KEY, { ...author, name })
  }

  if (items === undefined || items.length === 0) {
    return null
  }

  if (items.length === 1 && items[0].type === "book") {
    return (
      <Book
        book={items[0]}
        path={path}
        author={{ name: author.name, onChange: updateAuthorName }}
      />
    )
  }

  if (items.length === 1 && items[0].type === "series") {
    return (
      <Series
        path={path}
        series={items[0]}
        author={{ name: author.name, onChange: updateAuthorName }}
      />
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
      {items && (
        <ul>
          {items.map((item) => (
            <Fragment key={item.id}>{getComponent(item, path)}</Fragment>
          ))}
        </ul>
      )}
    </li>
  )
}
