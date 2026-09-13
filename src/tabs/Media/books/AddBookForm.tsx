import { AddMediaForm } from "../MediaForm"
import { useBookFormConfig } from "./bookFormConfig"

export function AddBookForm() {
  return <AddMediaForm ariaLabel="Add a book" config={useBookFormConfig()} />
}
