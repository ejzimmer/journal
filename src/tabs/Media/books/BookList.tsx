import { Book } from "./Book"
import { BookDetails } from "../types"

export function BookList({ books }: { books?: Record<string, BookDetails> }) {
  const bookDetails = books ? Object.values(books) : undefined

  return (
    bookDetails && (
      <ul>
        {bookDetails.map((book) => (
          <Book key={book.id} book={book} />
        ))}
      </ul>
    )
  )
}
