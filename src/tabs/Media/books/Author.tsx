import { useContext, useRef } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { AuthorDetails, BOOKS_KEY, BookDetails } from "../types"
import { EditableText } from "../../../shared/controls/EditableText"
import { getComponent } from "./utils"

export function Author({ author }: { author: AuthorDetails }) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const path = `${BOOKS_KEY}/${author.id}/items`
  const newBookRef = useRef<HTMLInputElement>(null)
  const items = author.items ? Object.values(author.items) : undefined

  const updateAuthorName = (name: string) => {
    storageContext.updateItem<AuthorDetails>(BOOKS_KEY, { ...author, name })
  }

  const addBook = (event: React.FormEvent) => {
    event.preventDefault()

    if (newBookRef.current?.value) {
      storageContext.addItem<BookDetails>(path, {
        title: newBookRef.current?.value,
        type: "book",
      })
      newBookRef.current.form?.reset()
    }
  }

  return (
    <>
      <div>
        <EditableText label="author name" onChange={updateAuthorName}>
          {author.name}
        </EditableText>
      </div>
      {items && (
        <ul>
          {items.map((item) => (
            <li key={item.id}>{getComponent(item, path)}</li>
          ))}
          <form onSubmit={addBook}>
            <input ref={newBookRef} />
          </form>
        </ul>
      )}
    </>
  )
}
