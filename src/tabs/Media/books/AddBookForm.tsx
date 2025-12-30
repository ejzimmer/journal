import { useContext, useRef, useState } from "react"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import {
  AuthorDetails,
  SeriesDetails,
  ReadingItemDetails,
  BOOKS_KEY,
  BookDetails,
  isSeries,
} from "../types"
import { TickIcon } from "../../../shared/icons/Tick"
import { SubmitButton } from "../SubmitButton"

type Option<T extends SeriesDetails<BookDetails> | AuthorDetails> = {
  text: string
  id?: string
  value?: T
}

const getSeriesForAuthor = (author: AuthorDetails) =>
  author.items ? Object.values(author.items).filter(isSeries) : []

export function AddBookForm() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const bookRef = useRef<HTMLInputElement>(null)
  const [author, setAuthor] = useState<Option<AuthorDetails>>()
  const [series, setSeries] = useState<Option<SeriesDetails<BookDetails>>>()

  const { value } = storageContext.useValue<ReadingItemDetails>(BOOKS_KEY)
  const items = value ? Object.values(value) : []

  const authors = items.filter((item) => item.type === "author")
  const authorSeries = authors.flatMap(getSeriesForAuthor)
  const serieses = [
    ...items.filter((item) => item.type === "series"),
    ...authorSeries,
  ]

  const onCreateItem = (event: React.FormEvent) => {
    event.preventDefault()
    const book = bookRef.current?.value
    if (!book) {
      return
    }

    const newBook: Omit<BookDetails, "id"> = { title: book, type: "book" }
    const addBookTo = (key: string) =>
      storageContext.addItem<BookDetails>(key, newBook)
    const createSeries = (key: string, name: string) =>
      storageContext.addItem<SeriesDetails<BookDetails>>(key, {
        name,
        type: "series",
      })
    if (author) {
      const authorKey =
        author.value && value?.[author.value.id]
          ? author.value.id
          : storageContext.addItem<AuthorDetails>(BOOKS_KEY, {
              name: author.text,
              type: "author",
            })
      if (series) {
        const seriesKey =
          series.value && author.value?.items?.[series.value.id]
            ? series.value.id
            : createSeries(`${BOOKS_KEY}/${authorKey}/items`, series.text)
        addBookTo(`${BOOKS_KEY}/${authorKey}/items/${seriesKey}/items`)
      } else {
        addBookTo(`${BOOKS_KEY}/${authorKey}/items`)
      }
    } else if (series) {
      const seriesKey =
        series.value && value?.[series.value.id]
          ? series.value.id
          : createSeries(BOOKS_KEY, series.text)
      addBookTo(`${BOOKS_KEY}/${seriesKey}/items`)
    } else {
      addBookTo(BOOKS_KEY)
    }

    setAuthor(undefined)
    setSeries(undefined)

    bookRef.current?.form?.reset()
  }

  return (
    <form className="create-new" onSubmit={onCreateItem}>
      <input aria-label="book" ref={bookRef} />
      <Combobox
        label="author"
        options={authors.map((author) => ({
          text: author.name,
          id: author.id,
          value: author,
        }))}
        value={author}
        createOption={(text) => ({ text })}
        onChange={setAuthor}
      />
      <Combobox<Option<SeriesDetails<BookDetails>>>
        label="series"
        options={(author?.value
          ? getSeriesForAuthor(author.value)
          : serieses
        ).map((series) => ({
          text: series.name,
          id: series.id,
          value: series,
        }))}
        value={{ ...series } as Option<SeriesDetails<BookDetails>>}
        createOption={(text) => ({ text })}
        onChange={setSeries}
      />
      <SubmitButton />
    </form>
  )
}
