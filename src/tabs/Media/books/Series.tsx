import { useContext } from "react"
import { EditableText } from "../../../shared/controls/EditableText"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { BookList } from "./BookList"
import { BookDetails, SeriesDetails } from "../types"

export function Series({
  series,
  path,
}: {
  series: SeriesDetails<BookDetails>
  path: string
}) {
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
      <div>
        <EditableText label="Series name" onChange={updateSeriesName}>
          {series.name}
        </EditableText>
      </div>
      <BookList
        books={series.items as Record<string, BookDetails>}
        path={`${path}/${series.id}/items`}
      />
    </li>
  )
}
