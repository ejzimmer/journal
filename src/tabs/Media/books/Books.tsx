import {
  BOOK_STATUS_ORDER,
  BookDetails,
  BookStatus,
  getBookStatus,
  isSeries,
  SeriesDetails,
} from "../types"
import { getCoverHue } from "../coverHue"
import { MediaList } from "../MediaList"
import { StatusConfig } from "../MediaSpine"
import { AddMediaForm, EditMediaForm } from "../MediaForm"
import { useBookFormConfig } from "./bookFormConfig"
import { Shelf } from "../Shelf"
import { useMediaStorage } from "../MediaStorageContext"

const BOOK_CONFIG: StatusConfig<BookDetails, BookStatus> = {
  order: BOOK_STATUS_ORDER,
  spineStatus: {
    unread: "todo",
    reading: "active",
    listening: "active",
    read: "done",
  },
  glyph: {
    unread: "📖",
    reading: "📖",
    listening: "🎧",
    read: "✓",
  },
  getStatus: getBookStatus,
  setStatus: (book, status) => ({ ...book, status }),
  getAuthor: (book) => book.author,
}

function BookMediaList({
  books,
  bandHue,
}: {
  books?: Record<string, BookDetails>
  bandHue?: number
}) {
  const config = useBookFormConfig()
  return (
    <MediaList
      items={books}
      bandHue={bandHue}
      hue={(book) => getCoverHue(book.author ?? book.title)}
      config={BOOK_CONFIG}
      editForm={(book) => ({ isOpen, onCancel }) => (
        <EditMediaForm
          item={book}
          isOpen={isOpen}
          onCancel={onCancel}
          config={config}
        />
      )}
    />
  )
}

export function Books() {
  const { books, updateMediaSeries } = useMediaStorage()

  const series = books.filter(
    (item): item is SeriesDetails<BookDetails> => isSeries(item),
  )
  const singleBooks = books.filter(
    (item): item is BookDetails => !isSeries(item),
  )

  return (
    <div className="books">
      <h2>Books</h2>
      <div className="shelves">
        {series.map((item) => (
          <Shelf
            key={item.id}
            label={item.name}
            onRenameLabel={(name) => updateMediaSeries(item, name)}
          >
            <BookMediaList books={item.items} bandHue={item.bandHue} />
          </Shelf>
        ))}
        {singleBooks.length > 0 && (
          <Shelf>
            <BookMediaList
              books={Object.fromEntries(
                singleBooks.map((book) => [book.id, book]),
              )}
            />
          </Shelf>
        )}
      </div>
      <AddMediaForm ariaLabel="Add a book" config={useBookFormConfig()} />
    </div>
  )
}
