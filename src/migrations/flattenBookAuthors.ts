import { useEffect } from "react"
import { useStorageContext } from "../shared/FirebaseContext"
import {
  BookDetails,
  BOOKS_KEY,
  ReadingItemDetails,
  SeriesDetails,
} from "../tabs/Media/types"

type AuthorDetails = {
  id: string
  type: "author"
  name: string
  items?: Record<string, SeriesDetails<BookDetails> | BookDetails>
}

export type StoredReadingItem = ReadingItemDetails | AuthorDetails

const isAuthor = (item: StoredReadingItem): item is AuthorDetails =>
  item.type === "author"

const withAuthor = (book: BookDetails, author: string): BookDetails => ({
  ...book,
  author,
})

const byId = <T extends { id: string }>(items: T[]): Record<string, T> =>
  items.reduce(
    (map, item) => {
      map[item.id] = item
      return map
    },
    {} as Record<string, T>,
  )

export function flattenBookAuthors(books: Record<string, StoredReadingItem>) {
  const items = Object.values(books)
  if (!items.some(isAuthor)) {
    return undefined
  }

  return byId(
    items.flatMap<ReadingItemDetails>((item) => {
      if (!isAuthor(item)) {
        return item
      }

      return Object.values(item.items ?? {}).map((child) =>
        child.type === "book"
          ? withAuthor(child, item.name)
          : {
              ...child,
              items: byId(
                Object.values(child.items ?? {}).map((book) =>
                  withAuthor(book, item.name),
                ),
              ),
            },
      )
    }),
  )
}

export function useFlattenBookAuthors() {
  const { useValue, setValue } = useStorageContext()
  const { value } = useValue<Record<string, StoredReadingItem>>(BOOKS_KEY)

  useEffect(() => {
    if (!value) return

    const flattened = flattenBookAuthors(value)
    if (flattened) {
      setValue(BOOKS_KEY, flattened)
    }
  }, [value, setValue])
}
