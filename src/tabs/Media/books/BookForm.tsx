import { BookDetails, NewBook } from "../types"
import { useMediaStorage } from "../MediaStorageContext"
import { MediaForm, MediaFormConfig } from "../MediaForm"

export function BookForm({ book }: { book?: BookDetails }) {
  const { authors, bookSeries } = useMediaStorage()

  const config: MediaFormConfig<BookDetails> = {
    typeLabel: "Book",
    seriesList: bookSeries,
    authorOptions: authors,
    getAuthor: (existingBook) => existingBook.author,
    buildNew: (title, author) =>
      ({
        type: "book",
        title,
        ...(author && { author }),
      }) satisfies NewBook,
    buildUpdated: (existingBook, title, author) => {
      const { author: _author, ...bookWithoutAuthor } = existingBook
      return { ...bookWithoutAuthor, title, ...(author && { author }) }
    },
  }

  return <MediaForm item={book} config={config} />
}
