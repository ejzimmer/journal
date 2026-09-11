import { Modal } from "../../../shared/controls/Modal"
import { BookForm } from "./BookForm"

export function AddBookForm() {
  return (
    <Modal
      trigger={(props) => (
        <button {...props} className="outline icon" aria-label="Add a book">
          +
        </button>
      )}
    >
      <BookForm />
    </Modal>
  )
}
