import { useContext } from "react"
import { EmojiCheckbox } from "../../../shared/controls/EmojiCheckbox"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { BookDetails } from "./types"

import "./Book.css"
import { XIcon } from "../../../shared/icons/X"
import { EditableText } from "../../../shared/controls/EditableText"

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
    <div className="book">
      <EditableText label="title" onChange={updateTitle}>
        {book.title}
      </EditableText>
      <button onClick={updateMedium}>{book.medium}</button>
      <EmojiCheckbox
        emoji="✅"
        isChecked={!!book.isDone}
        onChange={() => toggleDone()}
        label="done"
      />
      <button className="emoji ghost" onClick={deleteBook}>
        <XIcon width="16px" />
      </button>
    </div>
  )
}
