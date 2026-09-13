import { CSSProperties, useState } from "react"
import {
  BOOK_STATUS_ORDER,
  BookDetails,
  BookStatus,
  getBookStatus,
} from "../types"
import { EditBookForm } from "./EditBookForm"
import { useMediaStorage } from "../MediaStorageContext"
import { getCoverHue } from "../coverHue"

import "./Book.css"

function getNextBookStatus(status: BookStatus): BookStatus {
  const index = BOOK_STATUS_ORDER.indexOf(status)
  return BOOK_STATUS_ORDER[(index + 1) % BOOK_STATUS_ORDER.length]
}

const BOOK_STATUS_GLYPH: Record<BookStatus, string> = {
  unread: "📖",
  reading: "📖",
  listening: "🎧",
  read: "✓",
}

function getSpineHeight(title: string) {
  return 178 + Math.min(34, Math.round(title.length * 1.5))
}

export function Book({ book }: { book: BookDetails }) {
  const { updateMedia } = useMediaStorage()
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)

  const status = getBookStatus(book)
  const nextStatus = getNextBookStatus(status)
  const hue = getCoverHue(book.author ?? book.title)

  const cycleStatus = () => {
    updateMedia({ ...book, status: nextStatus })
  }

  return (
    <li
      className="book"
      data-status={status}
      style={
        {
          "--hue": hue,
          minHeight: getSpineHeight(book.title),
        } as CSSProperties
      }
    >
      <button
        className="title"
        aria-label={`${book.title}${book.author ? `, ${book.author}` : ""}, ${status}`}
        onClick={() => setIsEditFormOpen(true)}
      >
        <span className="spine-label">
          <span className="title-text">{book.title}</span>
          {book.author && <span className="author">{book.author}</span>}
        </span>
      </button>

      <button
        className="stamp"
        aria-label={`${book.title}: ${status}. Change to ${nextStatus}`}
        onClick={cycleStatus}
      >
        {BOOK_STATUS_GLYPH[status]}
      </button>

      <EditBookForm
        book={book}
        isOpen={isEditFormOpen}
        onCancel={() => setIsEditFormOpen(false)}
      />
    </li>
  )
}
