import { useRef, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { useStorageContext } from "../../../shared/FirebaseContext"
import {
  BookDetails,
  BOOKS_KEY,
  ReadingItemDetails,
  SeriesDetails,
} from "../types"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { SubmitButton } from "../SubmitButton"

const getAuthors = (items: Record<string, ReadingItemDetails>) => {
  const authors = new Set<string>()

  Object.values(items).forEach((item) => {
    const books = item.type === "book" ? [item] : Object.values(item.items ?? {})
    books.forEach(({ author }) => author && authors.add(author))
  })

  return [...authors]
}

export function AddBookForm() {
  const titleRef = useRef<HTMLInputElement>(null)
  const [author, setAuthor] = useState<OptionType>()
  const [series, setSeries] = useState<OptionType>()

  const { useValue, addItem } = useStorageContext()

  const { value } = useValue<Record<string, ReadingItemDetails>>(BOOKS_KEY)

  const authorOptions = value
    ? getAuthors(value).map((name) => ({ id: name, label: name }))
    : []

  const seriesOptions = value
    ? Object.values(value)
        .filter((item) => item.type === "series")
        .map((series) => ({ id: series.id, label: series.name }))
    : []

  const createItem = (event: React.FormEvent) => {
    event.preventDefault()

    const title = titleRef.current?.value
    if (!title) return

    let path = BOOKS_KEY

    if (series) {
      const id =
        series.id === ""
          ? addItem<SeriesDetails<BookDetails>>(path, {
              type: "series",
              name: series.label,
            })
          : series.id
      path = `${path}/${id}/items`
    }

    addItem<BookDetails>(path, {
      type: "book",
      title,
      ...(author && { author: author.label }),
    })
    ;(event.target as HTMLFormElement).reset()
    setAuthor(undefined)
    setSeries(undefined)
  }

  return (
    <form onSubmit={createItem} className="create-new">
      <FormControl label="Book title" ref={titleRef} />
      <Combobox
        label="Author name"
        value={author}
        options={authorOptions}
        createOption={(label) => ({ id: "", label })}
        onChange={setAuthor}
      />
      <Combobox
        label="Series name"
        value={series}
        options={seriesOptions}
        createOption={(label) => ({ id: "", label })}
        onChange={setSeries}
      />
      <SubmitButton label="Create" />
    </form>
  )
}
