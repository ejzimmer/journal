import { useRef, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { BookDetails, NewBook } from "../types"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { Modal, useModal } from "../../../shared/controls/Modal"
import { useMediaStorage } from "../MediaStorageContext"
import { useSeriesBand } from "../useSeriesBand"
import { BandColourPicker } from "../BandColourPicker"

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

  const {
    currentSeries,
    series,
    bandHue,
    setBandHue,
    changeSeries,
    updateSeriesBandHue,
    reset: resetSeriesBand,
    seriesOptions,
  } = useSeriesBand(book, bookSeries)

  const authorOptions = authors.map((name) => ({ id: name, label: name }))

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
        moveMedia(updatedBook, { name: series.label, bandHue })
      } else if (series?.id !== currentSeries?.id) {
        moveMedia(updatedBook, series && { id: series.id })
        const target = series && bookSeries.find((s) => s.id === series.id)
        updateSeriesBandHue(target)
      } else {
        updateMedia(updatedBook)
        updateSeriesBandHue(currentSeries)
      }
    } else {
      const newBook: NewBook = {
        type: "book",
        title,
        ...(author && { author: author.label }),
      }

      if (series && series.id === "") {
        addMediaSeries(series.label, newBook, bandHue)
      } else if (series) {
        addMedia(newBook, series.id)
        updateSeriesBandHue(bookSeries.find((s) => s.id === series.id))
      } else {
        addMedia(newBook)
      }

      if (titleRef.current) titleRef.current.value = ""
      setAuthor(undefined)
      resetSeriesBand()
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
            onChange={changeSeries}
          />
          {series && (
            <BandColourPicker
              label={`${series.label} band colour`}
              value={bandHue}
              onChange={setBandHue}
            />
          )}
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
