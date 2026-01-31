import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { Book, Reading } from "./Reading"

import "./index.css"

const path = "2026/other_goals"
const hasId = (book: Book): book is Required<Book> =>
  typeof book.id === "string"

export function OtherGoals() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing storage context")
  }

  const { value } = storageContext.useValue<Book>(path)
  const goals = value ? Object.values(value) : []

  const handleUpdateBook = (book: Book) => {
    if (hasId(book)) {
      storageContext.updateItem(path, book)
    } else {
      storageContext.addItem<Book>(path, book)
    }
  }

  return (
    <ul className="other-goals">
      {goals.map((goal) => (
        <li key={goal.id}>
          <Reading book={goal} onChange={handleUpdateBook} />
        </li>
      ))}
    </ul>
  )
}
