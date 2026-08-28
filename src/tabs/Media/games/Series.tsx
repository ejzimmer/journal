import { EditableText } from "../../../shared/controls/EditableText"
import { GameList } from "./GameList"
import { GameDetails, GAMES_KEY, SeriesDetails } from "../types"
import { useStorageContext } from "../../../shared/FirebaseContext"

export function Series({
  series,
  path,
}: {
  series: SeriesDetails<GameDetails>
  path: string
}) {
  const { updateItem } = useStorageContext()

  const updateSeriesName = (name: string) => {
    updateItem<SeriesDetails<GameDetails>>(path, {
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
      <GameList
        games={series.items as Record<string, GameDetails>}
        path={`${GAMES_KEY}/${series.id}/items`}
      />
    </li>
  )
}
