import { useContext, useMemo, useRef, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import {
  AuthorDetails,
  BookDetails,
  BOOKS_KEY,
  ReadingItemDetails,
  SeriesDetails,
} from "../types"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { SubmitButton } from "../SubmitButton"

export function AddBookForm() {
  const titleRef = useRef<HTMLInputElement>(null)
  const [author, setAuthor] = useState<OptionType>()
  const [series, setSeries] = useState<OptionType>()

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing storage context")
  }

  const { value } = storageContext.useValue<ReadingItemDetails>(BOOKS_KEY)
  const authorOptions = value
    ? Object.values(value)
        .filter((item) => item.type === "author")
        .map((author) => ({ id: author.id, label: author.name }))
    : []

  const seriesOptions = useMemo(() => {
    if (!value) {
      return []
    }

    if (author && !author.id) {
      return []
    }

    const items = author?.id ? (value[author.id] as AuthorDetails).items : value
    return items
      ? Object.values(items)
          .filter((item) => item.type === "series")
          .map((author) => ({ id: author.id, label: author.name }))
      : []
  }, [value, author])

  const createParentItem = <
    T extends AuthorDetails | SeriesDetails<BookDetails>
  >(
    item: T,
    path: string
  ) => {
    const id =
      item.id === ""
        ? storageContext.addItem(path, {
            type: item.type,
            name: item.name,
          })
        : item.id

    return `${path}/${id}/items`
  }

  const createItem = (event: React.FormEvent) => {
    event.preventDefault()

    const title = titleRef.current?.value
    if (!title) return

    let path = BOOKS_KEY

    if (author) {
      path = createParentItem(
        {
          id: author.id,
          type: "author",
          name: author.label,
        },
        path
      )
    }

    if (series) {
      path = createParentItem(
        {
          id: series.id,
          type: "series",
          name: series.label,
        },
        path
      )
    }

    storageContext?.addItem<BookDetails>(path, {
      type: "book",
      title,
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
      <SubmitButton />
    </form>
  )
}
