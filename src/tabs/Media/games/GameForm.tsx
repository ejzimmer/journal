import { GameDetails } from "../types"
import { useMediaStorage } from "../MediaStorageContext"
import { MediaForm, MediaFormConfig } from "../MediaForm"

export function GameForm({ game }: { game?: GameDetails }) {
  const { gameSeries } = useMediaStorage()

  const config: MediaFormConfig<GameDetails> = {
    typeLabel: "Game",
    seriesList: gameSeries,
    buildNew: (title) => ({ type: "game", title }),
    buildUpdated: (existingGame, title) => ({ ...existingGame, title }),
  }

  return <MediaForm item={game} config={config} />
}
