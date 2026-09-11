import { EditableText } from "../../../shared/controls/EditableText"
import { BookList } from "./BookList"
import { BookDetails, SeriesDetails } from "../types"
import { useMediaStorage } from "../MediaStorageContext"

export function Series({ series }: { series: SeriesDetails<BookDetails> }) {
  const { updateMediaSeries } = useMediaStorage()

  const updateSeriesName = (name: string) => {
    updateMediaSeries(series, name)
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
      <BookList books={series.items} />
    </li>
  )
}
