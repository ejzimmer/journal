import { useState } from "react"
import { GameDetails } from "../types"
import { EditGameForm } from "./EditGameForm"
import { useMediaStorage } from "../MediaStorageContext"
import { getCoverHue } from "../coverHue"
import { Spine } from "../Spine"
import { nextInCycle } from "../statusCycle"

const GAME_STATUS_ORDER = ["unplayed", "playing", "played"] as const

type GameStatus = (typeof GAME_STATUS_ORDER)[number]

function getGameStatus(game: GameDetails): GameStatus {
  if (game.status === "done") return "played"
  if (game.status === "in_progress") return "playing"
  return "unplayed"
}

function getStatusForGameStatus(status: GameStatus): GameDetails["status"] {
  if (status === "playing") return "in_progress"
  if (status === "played") return "done"
  return null
}

const GAME_STATUS_GLYPH: Record<GameStatus, string> = {
  unplayed: "🎮",
  playing: "🎮",
  played: "✓",
}

const GAME_SPINE_STATUS: Record<GameStatus, "todo" | "active" | "done"> = {
  unplayed: "todo",
  playing: "active",
  played: "done",
}

function getSpineHeight(title: string) {
  return 142 + Math.min(34, Math.round(title.length * 1.7))
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
  const { updateMedia } = useMediaStorage()
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)

  const status = getGameStatus(game)
  const nextStatus = nextInCycle(GAME_STATUS_ORDER, status)
  const hue = getCoverHue(seriesId ?? game.title)

  const cycleStatus = () => {
    updateMedia({
      ...game,
      status: getStatusForGameStatus(nextStatus),
    })
  }

  return (
    <Spine
      status={GAME_SPINE_STATUS[status]}
      hue={hue}
      bandHue={bandHue}
      minHeight={getSpineHeight(game.title)}
      title={game.title}
      glyph={GAME_STATUS_GLYPH[status]}
      titleAriaLabel={`${game.title}, ${status}`}
      stampAriaLabel={`${game.title}: ${status}. Change to ${nextStatus}`}
      onTitleClick={() => setIsEditFormOpen(true)}
      onStampClick={cycleStatus}
    >
      <EditGameForm
        game={game}
        isOpen={isEditFormOpen}
        onCancel={() => setIsEditFormOpen(false)}
      />
    </Spine>
  )
}
