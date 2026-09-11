import { useRef, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { NewBook } from "../types"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { FormModal } from "../../../shared/controls/FormModal"
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

  const createBook = () => {
    const title = titleRef.current?.value
    if (!title) return false

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

    setAuthor(undefined)
    setSeries(undefined)
    return true
  }

  return (
    <FormModal
      trigger={(props) => (
        <button {...props} className="outline icon" aria-label="Add a book">
          +
        </button>
      )}
      onSubmit={createBook}
      submitButtonText="Add a book"
    >
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
    </FormModal>
  )
}
