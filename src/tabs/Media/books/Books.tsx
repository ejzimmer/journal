import { isSeries } from "../types"
import { Book } from "./Book"
import { Series } from "./Series"
import { AddBookForm } from "./AddBookForm"
import { useMediaStorage } from "../MediaStorageContext"

export function Books() {
  const { books } = useMediaStorage()

  const series = books.filter(isSeries)
  const singles = books.filter((item) => !isSeries(item))

  return (
    <div className="books">
      <h2>Books</h2>
      <div className="case">
        {series.map((item) => (
          <Series key={item.id} series={item} />
        ))}
        {singles.length > 0 && (
          <div className="run singles">
            <ul className="run-books">
              {singles.map((book) => (
                <Book key={book.id} book={book} />
              ))}
            </ul>
          </div>
        )}
      </div>
      <AddBookForm />
    </div>
  )
}
