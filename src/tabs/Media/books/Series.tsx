import { useContext } from "react"
import { EditableText } from "../../../shared/controls/EditableText"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { BookList } from "./BookList"
import { BookDetails, SeriesDetails } from "../types"

type SeriesProps = {
  series: SeriesDetails<BookDetails>
  path: string
  author?: {
    name: string
    onChange: (name: string) => void
  }
}

export function Series({ series, path, author }: SeriesProps) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const updateSeriesName = (name: string) => {
    storageContext.updateItem<SeriesDetails<BookDetails>>(path, {
      ...series,
      name,
    })
  }

  return (
    <li className="series">
      <div style={{ display: "flex", gap: "8px" }}>
        <EditableText
          label="Series name"
          onChange={updateSeriesName}
          style={{
            textDecoration: author ? "" : "underline",
            fontWeight: author ? "bold" : "",
          }}
        >
          {series.name}
        </EditableText>
        {author && (
          <EditableText onChange={author.onChange} label="Author's name">
            {`(${author.name})`}
          </EditableText>
        )}
      </div>
      <BookList
        books={series.items as Record<string, BookDetails>}
        path={`${path}/${series.id}/items`}
      />
    </li>
  )
}
