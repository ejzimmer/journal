import { useState } from "react"
import { BookDetails } from "../types"
import { EditBookForm } from "./EditBookForm"
import { useMediaStorage } from "../MediaStorageContext"
import { getCoverHue } from "../coverHue"
import { Spine } from "../Spine"

const BOOK_STATUS_ORDER = ["unread", "reading", "listening", "read"] as const

type BookStatus = (typeof BOOK_STATUS_ORDER)[number]

function getBookStatus(book: BookDetails): BookStatus {
  if (book.isDone) return "read"
  if (book.medium === "📖") return "reading"
  if (book.medium === "🎧") return "listening"
  return "unread"
}

function getNextBookStatus(status: BookStatus): BookStatus {
  const index = BOOK_STATUS_ORDER.indexOf(status)
  return BOOK_STATUS_ORDER[(index + 1) % BOOK_STATUS_ORDER.length]
}

function getMediumForStatus(status: BookStatus): BookDetails["medium"] {
  if (status === "reading") return "📖"
  if (status === "listening") return "🎧"
  return null
}

const BOOK_STATUS_GLYPH: Record<BookStatus, string> = {
  unread: "📖",
  reading: "📖",
  listening: "🎧",
  read: "✓",
}

const BOOK_SPINE_STATUS: Record<BookStatus, "todo" | "active" | "done"> = {
  unread: "todo",
  reading: "active",
  listening: "active",
  read: "done",
}

function getSpineHeight(title: string) {
  return 178 + Math.min(34, Math.round(title.length * 1.5))
}

export function Book({
  book,
  bandHue,
}: {
  book: BookDetails
  bandHue?: number
}) {
  const { updateMedia } = useMediaStorage()
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)

  const status = getBookStatus(book)
  const nextStatus = getNextBookStatus(status)
  const hue = getCoverHue(book.author ?? book.title)

  const cycleStatus = () => {
    updateMedia({
      ...book,
      medium: getMediumForStatus(nextStatus),
      isDone: nextStatus === "read",
    })
  }

  return (
    <Spine
      status={BOOK_SPINE_STATUS[status]}
      hue={hue}
      bandHue={bandHue}
      minHeight={getSpineHeight(book.title)}
      title={book.title}
      author={book.author}
      glyph={BOOK_STATUS_GLYPH[status]}
      titleAriaLabel={`${book.title}${book.author ? `, ${book.author}` : ""}, ${status}`}
      stampAriaLabel={`${book.title}: ${status}. Change to ${nextStatus}`}
      onTitleClick={() => setIsEditFormOpen(true)}
      onStampClick={cycleStatus}
    >
      <EditBookForm
        book={book}
        isOpen={isEditFormOpen}
        onCancel={() => setIsEditFormOpen(false)}
      />
    </Spine>
  )
}
