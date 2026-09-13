import { isSeries } from "../types"
import { Book } from "./Book"
import { Series } from "./Series"
import { AddBookForm } from "./AddBookForm"
import { useMediaStorage } from "../MediaStorageContext"

export function Books() {
  const { books } = useMediaStorage()

  return (
    <div className="books">
      <h2>Books</h2>
      <div className="shelves">
        {books.map((item) =>
          isSeries(item) ? (
            <Series key={item.id} series={item} />
          ) : (
            <div className="shelf" key={item.id}>
              <ul className="spines">
                <Book book={item} />
              </ul>
            </div>
          ),
        )}
      </div>
      <AddBookForm />
    </div>
  )
}
