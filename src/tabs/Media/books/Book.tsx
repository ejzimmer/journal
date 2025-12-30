import { useContext } from "react"
import { EmojiCheckbox } from "../../../shared/controls/EmojiCheckbox"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { BookDetails } from "../types"

import { XIcon } from "../../../shared/icons/X"
import { EditableText } from "../../../shared/controls/EditableText"

import "./Book.css"
import { Checkbox } from "../../../shared/controls/Checkbox"

export function Book({ book, path }: { book: BookDetails; path: string }) {
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

      <div className="details">
        <EditableText label="title" onChange={updateTitle}>
          {book.title}
        </EditableText>
        <button
          className={`medium ${book.medium ? "" : "empty"}`}
          aria-label="update medium"
          onClick={updateMedium}
        >
          {book.medium}
        </button>
      </div>
      <button className="emoji ghost" onClick={deleteBook}>
        <XIcon width="16px" />
      </button>
    </li>
  )
}
