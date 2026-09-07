import { GameDetails, MediaList } from "../types"
import { XIcon } from "../../../shared/icons/X"
import { Checkbox } from "../../../shared/controls/Checkbox"
import { EditGameForm } from "./EditGameForm"
import { useMediaStorage } from "../MediaStorageContext"

import "./Game.css"

type GameProps = {
  game: GameDetails
  list: MediaList
}

export function Game({ game, list }: GameProps) {
  const { updateItem, removeFromList } = useMediaStorage()

  const updateStatus = (status: GameDetails["status"]) => {
    updateItem(list, { ...game, status })
  }

  return (
    <li className="game">
      <Checkbox
        isChecked={game.status === "done"}
        onChange={() => updateStatus(game.status === "done" ? null : "done")}
        aria-label="is played"
      />
      <div className={`details ${game.status}`}>
        <EditGameForm game={game} list={list} />
        <button
          className="status"
          aria-label="update status to in progress"
          onClick={() =>
            updateStatus(game.status === "in_progress" ? null : "in_progress")
          }
        >
          🎮
        </button>
      </div>
      <button
        className="emoji ghost"
        onClick={() => removeFromList(list, game)}
      >
        <XIcon width="16px" />
      </button>
    </li>
  )
}
