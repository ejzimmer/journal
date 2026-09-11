import { useRef, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { NewBook } from "../types"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { SubmitButton } from "../SubmitButton"
import { useMediaStorage } from "../MediaStorageContext"

export function AddBookForm() {
  const titleRef = useRef<HTMLInputElement>(null)
  const [author, setAuthor] = useState<OptionType>()
  const [series, setSeries] = useState<OptionType>()

  const { authors, bookSeries, addMedia, addMediaSeries } = useMediaStorage()

  const authorOptions = authors.map((name) => ({ id: name, label: name }))
  const seriesOptions = bookSeries.map((series) => ({
    id: series.id,
    label: series.name,
  }))

  const createItem = (event: React.FormEvent) => {
    event.preventDefault()

    const title = titleRef.current?.value
    if (!title) return

    const book: NewBook = {
      type: "book",
      title,
      ...(author && { author: author.label }),
    }

    if (series && series.id === "") {
      addMediaSeries(series.label, book)
    } else if (series) {
      addMedia(book, series.id)
    } else {
      addMedia(book)
    }

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
