import { GameDetails } from "../types"
import { useMediaStorage } from "../MediaStorageContext"
import { MediaFormConfig } from "../MediaForm"

export function useGameFormConfig(): MediaFormConfig<GameDetails> {
  const { gameSeries } = useMediaStorage()

  return {
    typeLabel: "Game",
    seriesList: gameSeries,
    buildNew: (title) => ({ type: "game", title }),
    buildUpdated: (game, title) => ({ ...game, title }),
  }
}
