import { useContext } from "react"
import { EditableText } from "../../../shared/controls/EditableText"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { GameList } from "./GameList"
import { GameDetails, GAMES_KEY, SeriesDetails } from "../types"

export function Series({
  series,
  path,
}: {
  series: SeriesDetails<GameDetails>
  path: string
}) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const updateSeriesName = (name: string) => {
    storageContext.updateItem<SeriesDetails<GameDetails>>(path, {
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
      <GameList
        games={series.items as Record<string, GameDetails>}
        path={`${GAMES_KEY}/${series.id}/items`}
      />
    </li>
  )
}
