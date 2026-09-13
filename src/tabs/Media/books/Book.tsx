import {
  BOOK_STATUS_ORDER,
  BookDetails,
  BookStatus,
  getBookStatus,
} from "../types"
import { EditBookForm } from "./EditBookForm"
import { getCoverHue } from "../coverHue"
import { MediaSpine, StatusConfig } from "../MediaSpine"

const BOOK_STATUS_GLYPH: Record<BookStatus, string> = {
  unread: "📖",
  reading: "📖",
  listening: "🎧",
  read: "✓",
}

const BOOK_CONFIG: StatusConfig<BookDetails, BookStatus> = {
  order: BOOK_STATUS_ORDER,
  spineStatus: {
    unread: "todo",
    reading: "active",
    listening: "active",
    read: "done",
  },
  glyph: BOOK_STATUS_GLYPH,
  getStatus: getBookStatus,
  applyStatus: (book, status) => ({ ...book, status }),
  getSpineHeight: (title) => 178 + Math.min(34, Math.round(title.length * 1.5)),
  getAuthor: (book) => book.author,
}

export function Book({
  book,
  bandHue,
}: {
  book: BookDetails
  bandHue?: number
}) {
  return (
    <MediaSpine
      item={book}
      bandHue={bandHue}
      hue={getCoverHue(book.author ?? book.title)}
      config={BOOK_CONFIG}
      editForm={({ isOpen, onCancel }) => (
        <EditBookForm book={book} isOpen={isOpen} onCancel={onCancel} />
      )}
    />
  )
}
