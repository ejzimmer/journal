import { useContext } from "react"
import { EditableText } from "../../../shared/controls/EditableText"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { BookList } from "./BookList"
import { SeriesDetails } from "./types"

export function Series({
  series,
  path,
}: {
  series: SeriesDetails
  path: string
}) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const updateSeriesName = (name: string) => {
    storageContext.updateItem<SeriesDetails>(path, {
      ...series,
      name,
    })
  }

  return (
    <>
      <div>
        <EditableText label="Series name" onChange={updateSeriesName}>
          {series.name}
        </EditableText>
      </div>
      <BookList books={series.books} path={series.id} />
    </>
  )
}
