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
    <div className="shelf">
      <div className="spines">
        <BookList books={series.items} bandHue={series.bandHue} />
      </div>
      <div className="shelf-label">
        <EditableText
          label="Series name"
          value={series.name}
          onChange={updateSeriesName}
        />
      </div>
    </div>
  )
}
