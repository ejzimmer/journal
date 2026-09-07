import { Book } from "./Book"
import { BookDetails, MediaList } from "../types"

export function BookList({
  books,
  list,
}: {
  books?: Record<string, BookDetails>
  list: MediaList
}) {
  const bookDetails = books ? Object.values(books) : undefined

  return (
    bookDetails && (
      <ul>
        {bookDetails.map((book) => (
          <Book key={book.id} book={book} list={list} />
        ))}
      </ul>
    )
  )
}
