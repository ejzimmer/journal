import { useContext, useRef } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { Book } from "./Book"
import { BookDetails, KEY } from "./types"

export function BookList({
  books,
  path,
}: {
  books?: Record<string, BookDetails>
  path: string
}) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const bookDetails = books ? Object.values(books) : undefined
  const newBookRef = useRef<HTMLInputElement>(null)

  const addBook = (event: React.FormEvent) => {
    event.preventDefault()

    if (newBookRef.current?.value) {
      storageContext.addItem<BookDetails>(`${KEY}/${path}/books`, {
        title: newBookRef.current?.value,
        type: "book",
      })
      newBookRef.current.form?.reset()
    }
  }

  return (
    bookDetails && (
      <ul>
        {bookDetails.map((book) => (
          <li key={book.id}>
            <Book book={book} path={`${KEY}/${path}/books`} />
          </li>
        ))}
        <form onSubmit={addBook}>
          <input ref={newBookRef} />
        </form>
      </ul>
    )
  )
}
