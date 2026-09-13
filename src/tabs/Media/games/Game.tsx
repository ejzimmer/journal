import { GameDetails } from "../types"
import { EditGameForm } from "./EditGameForm"
import { getCoverHue } from "../coverHue"
import { MediaSpine, StatusConfig } from "../MediaSpine"

const GAME_STATUS_ORDER = ["unplayed", "playing", "played"] as const

type GameStatus = (typeof GAME_STATUS_ORDER)[number]

function getStatusForGameStatus(status: GameStatus): GameDetails["status"] {
  if (status === "playing") return "in_progress"
  if (status === "played") return "done"
  return null
}

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
  getStatus: (game) => {
    if (game.status === "done") return "played"
    if (game.status === "in_progress") return "playing"
    return "unplayed"
  },
  applyStatus: (game, status) => ({
    ...game,
    status: getStatusForGameStatus(status),
  }),
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
