import { EditableText } from "../../../shared/controls/EditableText"
import { BookList } from "./BookList"
import { BookDetails, MediaList, SeriesDetails } from "../types"
import { useMediaStorage } from "../MediaStorageContext"

type SeriesProps = {
  series: SeriesDetails<BookDetails>
  list: MediaList
  author?: {
    name: string
    onChange: (name: string) => void
  }
}

export function Series({ series, list, author }: SeriesProps) {
  const { updateInList } = useMediaStorage()

  const updateSeriesName = (name: string) => {
    updateInList(list, { ...series, name })
  }

  return (
    <li className="series">
      <div style={{ display: "flex", gap: "8px" }}>
        <EditableText
          label="Series name"
          value={series.name}
          onChange={updateSeriesName}
          style={{
            textDecoration: author ? "" : "underline",
            fontWeight: author ? "bold" : "",
          }}
        />
        {author && (
          <span style={{ display: "inline-flex" }}>
            (
            <EditableText
              value={author.name}
              onChange={author.onChange}
              label="Author's name"
            />
            )
          </span>
        )}
      </div>
      <BookList
        books={series.items}
        list={{ ...list, series: { id: series.id, name: series.name } }}
      />
    </li>
  )
}
