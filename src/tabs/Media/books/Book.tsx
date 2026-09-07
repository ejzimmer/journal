import { BookDetails, MediaList } from "../types"
import { EditableText } from "../../../shared/controls/EditableText"
import { Checkbox } from "../../../shared/controls/Checkbox"
import { EditBookForm } from "./EditBookForm"
import { useMediaStorage } from "../MediaStorageContext"

import "./Book.css"

type BookProps = {
  book: BookDetails
  list: MediaList
  author?: {
    name: string
    onChange: (name: string) => void
  }
}

export function Book({ book, list, author }: BookProps) {
  const { updateItem } = useMediaStorage()

  const toggleDone = () => {
    updateItem(list, { ...book, isDone: !book.isDone })
  }

  const updateMedium = () => {
    const medium =
      book.medium == null ? "📖" : book.medium === "📖" ? "🎧" : null
    updateItem(list, { ...book, medium })
  }

  return (
    <li className="book">
      <Checkbox
        aria-label="is read"
        isChecked={!!book.isDone}
        onChange={toggleDone}
      />

      <span className={book.isDone ? "done" : ""}>
        <EditBookForm book={book} list={list} />
        {author && (
          <>
            {", "}
            <EditableText
              onChange={author.onChange}
              label="author name"
              value={author.name}
              style={{ display: "inline" }}
            />
          </>
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
