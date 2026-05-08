import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { BookDetails } from "../types"

import { EditableText } from "../../../shared/controls/EditableText"

import "./Book.css"
import { Checkbox } from "../../../shared/controls/Checkbox"
import { EditableTextWithDelete } from "../../../shared/controls/EditableTextWithDelete"

type BookProps = {
  book: BookDetails
  path: string
  author?: {
    name: string
    onChange: (name: string) => void
  }
}

export function Book({ book, path, author }: BookProps) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const updateTitle = (title: string) => {
    storageContext.updateItem<BookDetails>(path, {
      ...book,
      title,
    })
  }

  const toggleDone = () => {
    storageContext.updateItem<BookDetails>(path, {
      ...book,
      isDone: !book.isDone,
    })
  }

  const updateMedium = () => {
    const medium =
      book.medium === "🎧" ? "📖" : book.medium === "📖" ? null : "🎧"
    storageContext.updateItem<BookDetails>(path, {
      ...book,
      medium,
    })
  }

  const deleteBook = () => {
    storageContext.deleteItem(path, book)
  }

  return (
    <li className="book">
      <Checkbox
        aria-label="is read"
        isChecked={!!book.isDone}
        onChange={toggleDone}
      />

      <span className={book.isDone ? "done" : ""}>
        <EditableTextWithDelete
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
            style={{ display: "inline" }}
          >
            {author.name}
          </EditableText>
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
