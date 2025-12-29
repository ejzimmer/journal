import { useContext, useRef } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { AddBookForm } from "./AddBookForm"
import {
  ItemDetails,
  KEY,
  AuthorDetails,
  BookDetails,
  SeriesDetails,
} from "./types"

function getComponent<T extends ItemDetails>(item: T) {
  switch (item.type) {
    case "book":
      return item.title
    case "author":
      return <Author author={item} />
    case "series":
      return <Series series={item} />
  }
}

export function Books() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const { value } = storageContext.useValue<ItemDetails>(KEY)
  const items = value ? Object.values(value) : []

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h2>Books</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{getComponent(item)}</li>
        ))}
      </ul>
      <AddBookForm />
    </div>
  )
}

function Author({ author }: { author: AuthorDetails }) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const newBookRef = useRef<HTMLInputElement>(null)
  const books = author.books ? Object.values(author.books) : undefined
  const series = author.series ? Object.values(author.series) : undefined

  const addBook = (event: React.FormEvent) => {
    event.preventDefault()

    if (newBookRef.current?.value) {
      storageContext.addItem<BookDetails>(`${KEY}/${author.id}/books`, {
        title: newBookRef.current?.value,
        type: "book",
      })
      newBookRef.current.form?.reset()
    }
  }

  return (
    <>
      <div>{author.name}</div>
      {books && (
        <ul>
          {books.map((book) => (
            <li key={book.id}>{book.title}</li>
          ))}
          {series?.map((series) => (
            <li key={series.id}>
              <Series series={series} />
            </li>
          ))}
          <form onSubmit={addBook}>
            <input ref={newBookRef} />
          </form>
        </ul>
      )}
    </>
  )
}

function Series({ series }: { series: SeriesDetails }) {
  return (
    <>
      <div>{series.name}</div>
      <BookList books={series.books} path={series.id} />
    </>
  )
}

function BookList({
  books,
  path,
}: {
  books?: Record<string, BookDetails>
  path: string
}) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const bookDetails = books ? Object.values(books) : undefined
  const newBookRef = useRef<HTMLInputElement>(null)

  const addBook = (event: React.FormEvent) => {
    event.preventDefault()

    if (newBookRef.current?.value) {
      storageContext.addItem<BookDetails>(`${KEY}/${path}/books`, {
        title: newBookRef.current?.value,
        type: "book",
      })
      newBookRef.current.form?.reset()
    }
  }

  return (
    bookDetails && (
      <ul>
        {bookDetails.map((book) => (
          <li key={book.id}>{book.title}</li>
        ))}
        <form onSubmit={addBook}>
          <input ref={newBookRef} />
        </form>
      </ul>
    )
  )
}

// when an author is chosen, filter the series
// add a book to an existing series - via form & via list
// add a book & series to an existing author
// mark a book in progress reading/listening
// mark a book as read
// clear out read books in the new year
// clear out finished series
// clear out finished authors
// add author to book
// add series to book
// delete a book
