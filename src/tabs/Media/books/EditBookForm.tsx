import { BookDetails } from "../types"
import { EditMediaForm } from "../MediaForm"
import { useBookFormConfig } from "./bookFormConfig"

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
    <EditMediaForm
      item={book}
      isOpen={isOpen}
      onCancel={onCancel}
      config={useBookFormConfig()}
    />
  )
}
