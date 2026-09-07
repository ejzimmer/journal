import { useState } from "react"
import { FormModal } from "../../../shared/controls/FormModal"
import { FormControl } from "../../../shared/controls/FormControl"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { StatusField } from "../StatusField"
import { useMediaStorage } from "../MediaStorageContext"
import { BookDetails, ListParent, MediaList } from "../types"
import {
  BOOK_STATUS_OPTIONS,
  convertFromBookStatus,
  getBookStatus,
} from "./status"

type EditBookFormProps = {
  book: BookDetails
  list: MediaList
}

const toOption = ({ id, name }: ListParent) => ({ id, label: name })

const toParent = (option?: OptionType) =>
  option && { id: option.id, name: option.label }

export function EditBookForm({ book, list }: EditBookFormProps) {
  const { authors, seriesIn, removeFromList, moveToList } = useMediaStorage()

  const [title, setTitle] = useState(book.title)
  const [status, setStatus] = useState(getBookStatus(book))
  const [author, setAuthor] = useState(list.author && toOption(list.author))
  const [series, setSeries] = useState(list.series && toOption(list.series))

  const fillFromBook = () => {
    setTitle(book.title)
    setStatus(getBookStatus(book))
    setAuthor(list.author && toOption(list.author))
    setSeries(list.series && toOption(list.series))
  }

  const changeAuthor = (newAuthor: OptionType) => {
    setAuthor(newAuthor)
    if (newAuthor.id !== author?.id) {
      setSeries(undefined)
    }
  }

  const seriesOptions = seriesIn({
    root: "books",
    author: author?.id ? toParent(author) : undefined,
  }).map(toOption)

  const save = () => {
    if (!title.trim()) {
      removeFromList(list, book)
      return true
    }

    const updated: BookDetails = {
      ...book,
      title: title.trim(),
      ...convertFromBookStatus(status),
    }

    moveToList(updated, list, {
      root: "books",
      author: toParent(author),
      series: toParent(series),
    })
    return true
  }

  return (
    <FormModal
      trigger={({ onClick }) => (
        <button
          type="button"
          className="media-title"
          onClick={() => {
            fillFromBook()
            onClick()
          }}
        >
          {book.title}
        </button>
      )}
      onSubmit={save}
      submitButtonText="Save"
    >
      <FormControl label="Title" value={title} onChange={setTitle} />
      <StatusField
        legend="Status"
        options={BOOK_STATUS_OPTIONS}
        value={status}
        onChange={setStatus}
      />
      <Combobox
        label="Author"
        value={author}
        options={authors.map(toOption)}
        createOption={(label) => ({ id: "", label })}
        onChange={changeAuthor}
      />
      <Combobox
        label="Series"
        value={series}
        options={seriesOptions}
        createOption={(label) => ({ id: "", label })}
        onChange={setSeries}
      />
    </FormModal>
  )
}
