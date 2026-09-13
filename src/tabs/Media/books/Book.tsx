import { BookDetails } from "../types"
import { EditBookForm } from "./EditBookForm"
import { getCoverHue } from "../coverHue"
import { MediaSpine, StatusConfig } from "../MediaSpine"

const BOOK_STATUS_ORDER = ["unread", "reading", "listening", "read"] as const

type BookStatus = (typeof BOOK_STATUS_ORDER)[number]

function getMediumForStatus(status: BookStatus): BookDetails["medium"] {
  if (status === "reading") return "📖"
  if (status === "listening") return "🎧"
  return null
}

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
  getStatus: (book) => {
    if (book.isDone) return "read"
    if (book.medium === "📖") return "reading"
    if (book.medium === "🎧") return "listening"
    return "unread"
  },
  applyStatus: (book, status) => ({
    ...book,
    medium: getMediumForStatus(status),
    isDone: status === "read",
  }),
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
