import { CSSProperties, useState } from "react"
import { GameDetails } from "../types"
import { EditGameForm } from "./EditGameForm"
import { useMediaStorage } from "../MediaStorageContext"
import { getCoverHue } from "../coverHue"

import "./Game.css"

const GAME_STATUS_ORDER = ["unplayed", "playing", "played"] as const

type GameStatus = (typeof GAME_STATUS_ORDER)[number]

function getGameStatus(game: GameDetails): GameStatus {
  if (game.status === "done") return "played"
  if (game.status === "in_progress") return "playing"
  return "unplayed"
}

function getNextGameStatus(status: GameStatus): GameStatus {
  const index = GAME_STATUS_ORDER.indexOf(status)
  return GAME_STATUS_ORDER[(index + 1) % GAME_STATUS_ORDER.length]
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

function getSpineHeight(title: string) {
  return 142 + Math.min(34, Math.round(title.length * 1.7))
}

export function Game({ game }: { game: GameDetails }) {
  const { updateMedia } = useMediaStorage()
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)

  const status = getGameStatus(game)
  const nextStatus = getNextGameStatus(status)
  const hue = getCoverHue(game.title)

  const cycleStatus = () => {
    updateMedia({
      ...game,
      status: getStatusForGameStatus(nextStatus),
    })
  }

  return (
    <li
      className="game"
      data-status={status}
      style={
        {
          "--hue": hue,
          minHeight: getSpineHeight(game.title),
        } as CSSProperties
      }
    >
      <button
        className="title"
        aria-label={`${game.title}, ${status}`}
        onClick={() => setIsEditFormOpen(true)}
      >
        <span className="spine-label">
          <span className="title-text">{game.title}</span>
        </span>
      </button>

      <button
        className="stamp"
        aria-label={`${game.title}: ${status}. Change to ${nextStatus}`}
        onClick={cycleStatus}
      >
        {GAME_STATUS_GLYPH[status]}
      </button>

      <EditGameForm
        game={game}
        isOpen={isEditFormOpen}
        onCancel={() => setIsEditFormOpen(false)}
      />
    </li>
  )
}
