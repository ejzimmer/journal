import {
  GAME_STATUS_ORDER,
  GameDetails,
  GameStatus,
  getGameStatus,
} from "../types"
import { getCoverHue } from "../coverHue"
import { MediaList, StatusConfig } from "../MediaSpine"
import { EditGameForm } from "./EditGameForm"

const GAME_CONFIG: StatusConfig<GameDetails, GameStatus> = {
  order: GAME_STATUS_ORDER,
  spineStatus: {
    unplayed: "todo",
    playing: "active",
    played: "done",
  },
  glyph: {
    unplayed: "🎮",
    playing: "🎮",
    played: "✓",
  },
  getStatus: getGameStatus,
  applyStatus: (game, status) => ({ ...game, status }),
  getSpineHeight: (title) => 142 + Math.min(34, Math.round(title.length * 1.7)),
}

export function GameList({
  games,
  bandHue,
  seriesId,
}: {
  games?: Record<string, GameDetails>
  bandHue?: number
  seriesId?: string
}) {
  return (
    <MediaList
      items={games}
      bandHue={bandHue}
      hue={(game) => getCoverHue(seriesId ?? game.title)}
      config={GAME_CONFIG}
      editForm={(game) => ({ isOpen, onCancel }) => (
        <EditGameForm game={game} isOpen={isOpen} onCancel={onCancel} />
      )}
    />
  )
}
