import { BookDetails } from "../types"
import { ModalDialog } from "../../../shared/controls/ModalDialog"
import { BookForm } from "./BookForm"

export function EditBookForm({
  book,
  isOpen,
  onCancel,
}: {
  book: BookDetails
  isOpen: boolean
  onCancel: () => void
}) {
  return (
    <ModalDialog isOpen={isOpen} onCancel={onCancel}>
      {isOpen && <BookForm book={book} />}
    </ModalDialog>
  )
}
