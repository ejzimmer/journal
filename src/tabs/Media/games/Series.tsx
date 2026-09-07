import { EditableText } from "../../../shared/controls/EditableText"
import { GameList } from "./GameList"
import { GameDetails, MediaList, SeriesDetails } from "../types"
import { useMediaStorage } from "../MediaStorageContext"

const GAMES: MediaList = { root: "games" }

export function Series({ series }: { series: SeriesDetails<GameDetails> }) {
  const { updateInList } = useMediaStorage()

  const updateSeriesName = (name: string) => {
    updateInList(GAMES, { ...series, name })
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
      <GameList
        games={series.items}
        list={{
          root: "games",
          series: { id: series.id, name: series.name },
        }}
      />
    </li>
  )
}
