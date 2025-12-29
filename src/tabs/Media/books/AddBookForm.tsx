import { useContext, useRef, useState } from "react"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import {
  AuthorDetails,
  SeriesDetails,
  ItemDetails,
  BOOKS_KEY,
  BookDetails,
} from "../types"

export function AddBookForm() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const bookRef = useRef<HTMLInputElement>(null)
  const [author, setAuthor] = useState<{
    text: string
    value?: AuthorDetails
  }>()
  const [series, setSeries] = useState<{
    text: string
    value?: SeriesDetails
  }>()

  const { value } = storageContext.useValue<ItemDetails>(BOOKS_KEY)
  const items = value ? Object.values(value) : []

  const authors = items.filter((item) => item.type === "author")
  const authorSeries = authors.flatMap((author) =>
    author.series ? Object.values(author.series) : []
  )
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
      storageContext.addItem<SeriesDetails>(key, {
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
          series.value && author.value?.series?.[series.value.id]
            ? series.value.id
            : createSeries(`${BOOKS_KEY}/${authorKey}/series`, series.text)
        addBookTo(`${BOOKS_KEY}/${authorKey}/series/${seriesKey}/items`)
      } else {
        addBookTo(`${BOOKS_KEY}/${authorKey}/books`)
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
    <form onSubmit={onCreateItem}>
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
      <Combobox
        label="series"
        options={(author?.value?.series
          ? Object.values(author.value.series)
          : serieses
        ).map((series) => ({
          text: series.name,
          id: series.id,
          value: series,
        }))}
        value={series}
        createOption={(text) => ({ text })}
        onChange={setSeries}
      />
      <button type="submit">submit</button>
    </form>
  )
}
