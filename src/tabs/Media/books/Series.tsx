import { EditableText } from "../../../shared/controls/EditableText"
import { BookList } from "./BookList"
import { BookDetails, SeriesDetails } from "../types"
import { useStorageContext } from "../../../shared/FirebaseContext"

export function Series({
  series,
  path,
}: {
  series: SeriesDetails<BookDetails>
  path: string
}) {
  const { updateItem } = useStorageContext()

  const updateSeriesName = (name: string) => {
    updateItem<SeriesDetails<BookDetails>>(path, {
      ...series,
      name,
    })
  }

  return (
    <li className="series">
      <div>
        <EditableText
          label="Series name"
          value={series.name}
          onChange={updateSeriesName}
          style={{ fontWeight: "bold" }}
        />
      </div>
      <BookList
        books={series.items as Record<string, BookDetails>}
        path={`${path}/${series.id}/items`}
      />
    </li>
  )
}
