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
    <li className="series">
      <div>
        <EditableText
          label="Series name"
          value={series.name}
          onChange={updateSeriesName}
          style={{ fontWeight: "bold" }}
        />
      </div>
      <GameList games={series.items} />
    </li>
  )
}
