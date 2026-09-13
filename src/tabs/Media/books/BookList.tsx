import {
  BOOK_STATUS_ORDER,
  BookDetails,
  BookStatus,
  getBookStatus,
} from "../types"
import { getCoverHue } from "../coverHue"
import { MediaList, StatusConfig } from "../MediaSpine"
import { EditBookForm } from "./EditBookForm"

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
  applyStatus: (book, status) => ({ ...book, status }),
  getSpineHeight: (title) => 178 + Math.min(34, Math.round(title.length * 1.5)),
  getAuthor: (book) => book.author,
}

export function BookList({
  books,
  bandHue,
}: {
  books?: Record<string, BookDetails>
  bandHue?: number
}) {
  return (
    <MediaList
      items={books}
      bandHue={bandHue}
      hue={(book) => getCoverHue(book.author ?? book.title)}
      config={BOOK_CONFIG}
      editForm={(book) => ({ isOpen, onCancel }) => (
        <EditBookForm book={book} isOpen={isOpen} onCancel={onCancel} />
      )}
    />
  )
}
