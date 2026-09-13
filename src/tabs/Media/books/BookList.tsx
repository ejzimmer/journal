import { Book } from "./Book"
import { BookDetails } from "../types"

export function BookList({
  books,
  bandHue,
}: {
  books?: Record<string, BookDetails>
  bandHue?: number
}) {
  const bookDetails = books ? Object.values(books) : undefined

  return (
    bookDetails && (
      <ul className="matched-set">
        {bookDetails.map((book) => (
          <Book key={book.id} book={book} bandHue={bandHue} />
        ))}
      </ul>
    )
  )
}
