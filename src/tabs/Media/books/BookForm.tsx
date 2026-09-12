import { useRef, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { BookDetails, NewBook } from "../types"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { Modal, useModal } from "../../../shared/controls/Modal"
import { useMediaStorage } from "../MediaStorageContext"

export function BookForm({ book }: { book?: BookDetails }) {
  const titleRef = useRef<HTMLInputElement>(null)
  const [author, setAuthor] = useState<OptionType | undefined>(
    book?.author ? { id: book.author, label: book.author } : undefined,
  )

  const {
    authors,
    bookSeries,
    addMedia,
    addMediaSeries,
    updateMedia,
    moveMedia,
    deleteMedia,
  } = useMediaStorage()
  const { closeModal } = useModal()

  const currentSeries = book
    ? bookSeries.find((series) => book.id in (series.items ?? {}))
    : undefined

  const [series, setSeries] = useState<OptionType | undefined>(
    currentSeries
      ? { id: currentSeries.id, label: currentSeries.name }
      : undefined,
  )

  const authorOptions = authors.map((name) => ({ id: name, label: name }))
  const seriesOptions = bookSeries.map((series) => ({
    id: series.id,
    label: series.name,
  }))

  const saveBook = (event: React.FormEvent) => {
    event.preventDefault()

    const title = titleRef.current?.value
    if (!title) return

    if (book) {
      const { author: _author, ...bookWithoutAuthor } = book
      const updatedBook: BookDetails = {
        ...bookWithoutAuthor,
        title,
        ...(author && { author: author.label }),
      }

      if (series && series.id === "") {
        moveMedia(updatedBook, { name: series.label })
      } else if (series?.id !== currentSeries?.id) {
        moveMedia(updatedBook, series && { id: series.id })
      } else {
        updateMedia(updatedBook)
      }
    } else {
      const newBook: NewBook = {
        type: "book",
        title,
        ...(author && { author: author.label }),
      }

      if (series && series.id === "") {
        addMediaSeries(series.label, newBook)
      } else if (series) {
        addMedia(newBook, series.id)
      } else {
        addMedia(newBook)
      }

      if (titleRef.current) titleRef.current.value = ""
      setAuthor(undefined)
      setSeries(undefined)
    }

    closeModal()
  }

  const removeBook = () => {
    if (book) deleteMedia(book)
  }

  return (
    <form onSubmit={saveBook}>
      <Modal.Body>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <FormControl
            label="Book title"
            ref={titleRef}
            defaultValue={book?.title}
          />
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
        </div>
      </Modal.Body>
      <Modal.Footer>
        {book && (
          <Modal.Action onClick={removeBook} className="danger">
            Delete book
          </Modal.Action>
        )}
        <Modal.Cancel>Cancel</Modal.Cancel>
        <Modal.Action className="primary">Save</Modal.Action>
      </Modal.Footer>
    </form>
  )
}
