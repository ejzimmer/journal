import { EditableText } from "../../../shared/controls/EditableText"
import { GameList } from "./GameList"
import { GameDetails, SeriesDetails } from "../types"
import { useMediaStorage } from "../MediaStorageContext"

export function Series({ series }: { series: SeriesDetails<GameDetails> }) {
  const { updateMediaSeries } = useMediaStorage()

  const updateSeriesName = (name: string) => {
    updateMediaSeries(series, name)
  }

  return (
    <div className="run">
      <div className="run-books">
        <GameList games={series.items} band={series.band} seriesId={series.id} />
      </div>
      <div className="run-label">
        <EditableText
          label="Series name"
          value={series.name}
          onChange={updateSeriesName}
        />
      </div>
    </div>
  )
}
