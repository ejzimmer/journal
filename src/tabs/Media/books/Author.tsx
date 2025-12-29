import { useContext, useRef } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { Book } from "./Book"
import { AuthorDetails, KEY, BookDetails } from "./types"
import { Series } from "./Series"
import { EditableText } from "../../../shared/controls/EditableText"

export function Author({ author }: { author: AuthorDetails }) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const path = `${KEY}/${author.id}`
  const newBookRef = useRef<HTMLInputElement>(null)
  const books = author.books ? Object.values(author.books) : undefined
  const series = author.series ? Object.values(author.series) : undefined

  const updateAuthorName = (name: string) => {
    storageContext.updateItem<AuthorDetails>(KEY, { ...author, name })
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
      {books && (
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <Book book={book} path={`${path}/books`} />
            </li>
          ))}
          {series?.map((series) => (
            <li key={series.id}>
              <Series series={series} path={`${path}/series`} />
            </li>
          ))}
          <form onSubmit={addBook}>
            <input ref={newBookRef} />
          </form>
        </ul>
      )}
    </>
  )
}
