import {
  GAME_STATUS_ORDER,
  GameDetails,
  GameStatus,
  getGameStatus,
} from "../types"
import { EditGameForm } from "./EditGameForm"
import { getCoverHue } from "../coverHue"
import { MediaSpine, StatusConfig } from "../MediaSpine"

const GAME_STATUS_GLYPH: Record<GameStatus, string> = {
  unplayed: "🎮",
  playing: "🎮",
  played: "✓",
}

const GAME_CONFIG: StatusConfig<GameDetails, GameStatus> = {
  order: GAME_STATUS_ORDER,
  spineStatus: {
    unplayed: "todo",
    playing: "active",
    played: "done",
  },
  glyph: GAME_STATUS_GLYPH,
  getStatus: getGameStatus,
  applyStatus: (game, status) => ({ ...game, status }),
  getSpineHeight: (title) => 142 + Math.min(34, Math.round(title.length * 1.7)),
}

export function Game({
  game,
  bandHue,
  seriesId,
}: {
  game: GameDetails
  bandHue?: number
  seriesId?: string
}) {
  return (
    <MediaSpine
      item={game}
      bandHue={bandHue}
      hue={getCoverHue(seriesId ?? game.title)}
      config={GAME_CONFIG}
      editForm={({ isOpen, onCancel }) => (
        <EditGameForm game={game} isOpen={isOpen} onCancel={onCancel} />
      )}
    />
  )
}
