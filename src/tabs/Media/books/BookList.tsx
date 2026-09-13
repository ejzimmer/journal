import { Book } from "./Book"
import { BookDetails } from "../types"

export function BookList({
  books,
  band,
}: {
  books?: Record<string, BookDetails>
  band?: number
}) {
  const bookDetails = books ? Object.values(books) : undefined

  return (
    bookDetails && (
      <ul className="ser-set">
        {bookDetails.map((book) => (
          <Book key={book.id} book={book} band={band} />
        ))}
      </ul>
    )
  )
}
