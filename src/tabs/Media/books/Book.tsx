import { BookDetails } from "../types"

import { EditableText } from "../../../shared/controls/EditableText"

import "./Book.css"
import { Checkbox } from "../../../shared/controls/Checkbox"
import { useMediaStorage } from "../MediaStorageContext"

export function Book({ book }: { book: BookDetails }) {
  const { updateMedia, deleteMedia } = useMediaStorage()

  const updateTitle = (title: string) => {
    updateMedia({
      ...book,
      title,
    })
  }

  const updateAuthor = (author: string) => {
    updateMedia({
      ...book,
      author,
    })
  }

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

  const deleteBook = () => {
    deleteMedia(book)
  }

  return (
    <li className="book">
      <Checkbox
        aria-label="is read"
        isChecked={!!book.isDone}
        onChange={toggleDone}
      />

      <span className={book.isDone ? "done" : ""}>
        <EditableText
          label="title"
          onChange={updateTitle}
          style={{
            fontStyle: "italic",
            display: "inline",
          }}
          value={`${book.title}${book.author ? ", " : ""}`}
          onDelete={deleteBook}
        />
        {book.author && (
          <EditableText
            onChange={updateAuthor}
            label="author name"
            value={book.author}
            style={{ display: "inline" }}
          />
        )}

        <button
          className={`medium ${book.medium ? "" : "empty"}`}
          aria-label="update medium"
          onClick={updateMedium}
          style={{ marginInlineStart: "8px" }}
        >
          {book.medium ?? "📖"}
        </button>
      </span>
    </li>
  )
}
