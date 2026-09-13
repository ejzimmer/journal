import { BookDetails, NewBook } from "../types"
import { useMediaStorage } from "../MediaStorageContext"
import { MediaFormConfig } from "../MediaForm"

export function useBookFormConfig(): MediaFormConfig<BookDetails> {
  const { authors, bookSeries } = useMediaStorage()

  return {
    typeLabel: "Book",
    seriesList: bookSeries,
    authorOptions: authors,
    getAuthor: (book) => book.author,
    buildNew: (title, author) =>
      ({
        type: "book",
        title,
        ...(author && { author }),
      }) satisfies NewBook,
    buildUpdated: (book, title, author) => {
      const { author: _author, ...bookWithoutAuthor } = book
      return { ...bookWithoutAuthor, title, ...(author && { author }) }
    },
  }
}
