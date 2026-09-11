import { useStorageContext } from "../../../shared/FirebaseContext"
import { BookDetails } from "../types"

import { EditableText } from "../../../shared/controls/EditableText"

import "./Book.css"
import { Checkbox } from "../../../shared/controls/Checkbox"

export function Book({ book, path }: { book: BookDetails; path: string }) {
  const { updateItem, deleteItem } = useStorageContext()

  const updateTitle = (title: string) => {
    updateItem<BookDetails>(path, {
      ...book,
      title,
    })
  }

  const updateAuthor = (author: string) => {
    updateItem<BookDetails>(path, {
      ...book,
      author,
    })
  }

  const toggleDone = () => {
    updateItem<BookDetails>(path, {
      ...book,
      isDone: !book.isDone,
    })
  }

  const updateMedium = () => {
    const medium =
      book.medium == null ? "📖" : book.medium === "📖" ? "🎧" : null
    updateItem<BookDetails>(path, {
      ...book,
      medium,
    })
  }

  const deleteBook = () => {
    deleteItem(path, book)
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
