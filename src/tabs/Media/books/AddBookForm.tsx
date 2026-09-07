import { useRef, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { BookDetails } from "../types"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { SubmitButton } from "../SubmitButton"
import { useMediaStorage } from "../MediaStorageContext"

const convertToListParent = (option?: OptionType) =>
  option && { id: option.id, name: option.label }

export function AddBookForm() {
  const titleRef = useRef<HTMLInputElement>(null)
  const [author, setAuthor] = useState<OptionType>()
  const [series, setSeries] = useState<OptionType>()

  const { authors, getSeriesInList, addToList } = useMediaStorage()

  const seriesOptions = getSeriesInList({
    root: "books",
    author: author?.id ? convertToListParent(author) : undefined,
  }).map(({ id, name }) => ({ id, label: name }))

  const createItem = (event: React.FormEvent) => {
    event.preventDefault()

    const title = titleRef.current?.value
    if (!title) return

    addToList<BookDetails>(
      {
        root: "books",
        author: convertToListParent(author),
        series: convertToListParent(series),
      },
      { type: "book", title },
    )
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
        options={authors.map(({ id, name }) => ({ id, label: name }))}
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
