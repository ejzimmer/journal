import { useState } from "react"
import { GameDetails } from "../types"

import { Checkbox } from "../../../shared/controls/Checkbox"
import { EditGameForm } from "./EditGameForm"
import { useMediaStorage } from "../MediaStorageContext"

import "./Game.css"

export function Game({ game }: { game: GameDetails }) {
  const { updateMedia } = useMediaStorage()
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)

  const updateStatus = (status: GameDetails["status"]) => {
    updateMedia({
      ...game,
      status,
    })
  }

  return (
    <li className="game">
      <Checkbox
        isChecked={game.status === "done"}
        onChange={() => updateStatus(game.status === "done" ? null : "done")}
        aria-label="is played"
      />
      <div className={`details ${game.status}`}>
        <button
          className="title"
          aria-label={`Edit ${game.title}`}
          onClick={() => setIsEditFormOpen(true)}
        >
          {game.title}
        </button>
        <button
          aria-label="update status to in progress"
          onClick={() =>
            updateStatus(game.status === "in_progress" ? null : "in_progress")
          }
        >
          🎮
        </button>
      </div>

      <EditGameForm
        game={game}
        isOpen={isEditFormOpen}
        onCancel={() => setIsEditFormOpen(false)}
      />
    </li>
  )
}
