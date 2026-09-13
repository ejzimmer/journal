import { isSeries } from "../types"
import { BookList } from "./BookList"
import { AddBookForm } from "./AddBookForm"
import { Shelf } from "../Shelf"
import { useMediaStorage } from "../MediaStorageContext"

export function Books() {
  const { books, updateMediaSeries } = useMediaStorage()

  return (
    <div className="books">
      <h2>Books</h2>
      <div className="shelves">
        {books.map((item) =>
          isSeries(item) ? (
            <Shelf
              key={item.id}
              label={item.name}
              onRenameLabel={(name) => updateMediaSeries(item, name)}
            >
              <BookList books={item.items} bandHue={item.bandHue} />
            </Shelf>
          ) : (
            <Shelf key={item.id}>
              <BookList books={{ [item.id]: item }} />
            </Shelf>
          ),
        )}
      </div>
      <AddBookForm />
    </div>
  )
}
