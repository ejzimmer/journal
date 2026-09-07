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

const convertToOption = ({ id, name }: ListParent) => ({ id, label: name })

const convertToListParent = (option?: OptionType) =>
  option && { id: option.id, name: option.label }

export function EditBookForm({ book, list }: EditBookFormProps) {
  const { authors, getSeriesInList, removeFromList, moveToList } =
    useMediaStorage()

  const [title, setTitle] = useState(book.title)
  const [status, setStatus] = useState(getBookStatus(book))
  const [author, setAuthor] = useState(
    list.author && convertToOption(list.author),
  )
  const [series, setSeries] = useState(
    list.series && convertToOption(list.series),
  )

  const fillFieldsFromBook = () => {
    setTitle(book.title)
    setStatus(getBookStatus(book))
    setAuthor(list.author && convertToOption(list.author))
    setSeries(list.series && convertToOption(list.series))
  }

  const changeAuthor = (newAuthor: OptionType) => {
    setAuthor(newAuthor)
    if (newAuthor.id !== author?.id) {
      setSeries(undefined)
    }
  }

  const seriesOptions = getSeriesInList({
    root: "books",
    author: author?.id ? convertToListParent(author) : undefined,
  }).map(convertToOption)

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
      author: convertToListParent(author),
      series: convertToListParent(series),
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
            fillFieldsFromBook()
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
        options={authors.map(convertToOption)}
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
