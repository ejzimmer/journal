import { BookDetails, MediaList } from "../types"

import { EditableText } from "../../../shared/controls/EditableText"

import "./Book.css"
import { Checkbox } from "../../../shared/controls/Checkbox"
import { useMediaStorage } from "../MediaStorageContext"

type BookProps = {
  book: BookDetails
  list: MediaList
  author?: {
    name: string
    onChange: (name: string) => void
  }
}

export function Book({ book, list, author }: BookProps) {
  const { updateInList, removeFromList } = useMediaStorage()

  const updateTitle = (title: string) => {
    updateInList(list, { ...book, title })
  }

  const toggleDone = () => {
    updateInList(list, { ...book, isDone: !book.isDone })
  }

  const updateMedium = () => {
    const medium =
      book.medium == null ? "📖" : book.medium === "📖" ? "🎧" : null
    updateInList(list, { ...book, medium })
  }

  const deleteBook = () => {
    removeFromList(list, book)
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
          value={`${book.title}${author ? ", " : ""}`}
          onDelete={deleteBook}
        />
        {author && (
          <EditableText
            onChange={author.onChange}
            label="author name"
            value={author.name}
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
