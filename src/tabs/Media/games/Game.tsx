import { GameDetails } from "../types"

import { XIcon } from "../../../shared/icons/X"
import { EditableText } from "../../../shared/controls/EditableText"
import { Checkbox } from "../../../shared/controls/Checkbox"

import "./Game.css"
import { useMediaStorage } from "../MediaStorageContext"

export function Game({ game }: { game: GameDetails }) {
  const { updateMedia, deleteMedia } = useMediaStorage()

  const updateTitle = (title: string) => {
    updateMedia({
      ...game,
      title,
    })
  }

  const updateStatus = (status: GameDetails["status"]) => {
    updateMedia({
      ...game,
      status,
    })
  }

  const deleteGame = () => {
    deleteMedia(game)
  }

  return (
    <li className="game">
      <Checkbox
        isChecked={game.status === "done"}
        onChange={() => updateStatus(game.status === "done" ? null : "done")}
        aria-label="is played"
      />
      <div className={`details ${game.status}`}>
        <EditableText label="title" value={game.title} onChange={updateTitle} />
        <button
          aria-label="update status to in progress"
          onClick={() =>
            updateStatus(game.status === "in_progress" ? null : "in_progress")
          }
        >
          🎮
        </button>
      </div>
      <button className="emoji ghost" onClick={deleteGame}>
        <XIcon width="16px" />
      </button>
    </li>
  )
}
