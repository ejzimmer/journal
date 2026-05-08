import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { Book } from "./Book"
import { BookDetails } from "../types"

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

  return (
    bookDetails && (
      <ul>
        {bookDetails.map((book) => (
          <Book key={book.id} book={book} path={path} />
        ))}
      </ul>
    )
  )
}
