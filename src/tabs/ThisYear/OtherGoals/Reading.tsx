import { useState } from "react"
import { XIcon } from "../../../shared/icons/X"

export type Book = {
  id?: string
  title: string
  volumes: { totalPages: number; readPages?: number }[]
}

type BookProps = { book: Book; onChange: (book: Book) => void }

export function Reading({ book, onChange }: BookProps) {
  return (
    <>
      <div>{book.title}</div>
      <div>
        {book.volumes.map((pages, index) => (
          <PagesRead
            key={`volume-${index}`}
            totalPages={pages.totalPages}
            readPages={pages.readPages ?? 0}
            onChange={(readPages) =>
              onChange({
                ...book,
                volumes: book.volumes.with(index, {
                  totalPages: pages.totalPages,
                  readPages,
                }),
              })
            }
          />
        ))}
      </div>
    </>
  )
}

type PagesReadProps = {
  totalPages: number
  readPages: number
  onChange: (pages: number) => void
}

function PagesRead({ totalPages, readPages, onChange }: PagesReadProps) {
  const [isEditing, setEditing] = useState(false)

  const handleUpdate = (event: React.FormEvent) => {
    event.preventDefault()

    const pages = Number.parseInt(
      ((event.target as HTMLFormElement).elements[0] as HTMLInputElement).value,
    )
    if (!isNaN(pages) && pages !== readPages) {
      onChange(pages)
    }

    setEditing(false)
  }

  return (
    <div className="volume">
      <progress max={totalPages} value={readPages} />
      <form onSubmit={handleUpdate}>
        {isEditing && <input type="number" size={4} defaultValue={readPages} />}
        <button
          className="icon ghost"
          onClick={(event) => {
            if (!isEditing) {
              event.preventDefault()
              setEditing(true)
            }
          }}
        >
          {isEditing ? <XIcon width="12px" /> : "✏️"}
        </button>
      </form>
    </div>
  )
}
