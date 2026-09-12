import { useState } from "react"
import { BookDetails } from "../types"

import { Checkbox } from "../../../shared/controls/Checkbox"
import { EditBookForm } from "./EditBookForm"
import { useMediaStorage } from "../MediaStorageContext"

import "./Book.css"

export function Book({ book }: { book: BookDetails }) {
  const { updateMedia } = useMediaStorage()
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)

  const toggleDone = () => {
    updateMedia({
      ...book,
      isDone: !book.isDone,
    })
  }

  const updateMedium = () => {
    const medium =
      book.medium == null ? "📖" : book.medium === "📖" ? "🎧" : null
    updateMedia({
      ...book,
      medium,
    })
  }

  return (
    <li className="book">
      <Checkbox
        aria-label="is read"
        isChecked={!!book.isDone}
        onChange={toggleDone}
      />

      <span className={book.isDone ? "done" : ""}>
        <button
          className="title"
          aria-label={`Edit ${book.title}`}
          onClick={() => setIsEditFormOpen(true)}
        >
          {book.title}
          {book.author ? `, ${book.author}` : ""}
        </button>

        <button
          className={`medium ${book.medium ? "" : "empty"}`}
          aria-label="update medium"
          onClick={updateMedium}
          style={{ marginInlineStart: "8px" }}
        >
          {book.medium ?? "📖"}
        </button>
      </span>

      <EditBookForm
        book={book}
        isOpen={isEditFormOpen}
        onCancel={() => setIsEditFormOpen(false)}
      />
    </li>
  )
}
