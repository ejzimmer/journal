import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { GameDetails } from "../types"

import { XIcon } from "../../../shared/icons/X"
import { EditableText } from "../../../shared/controls/EditableText"
import { Checkbox } from "../../../shared/controls/Checkbox"

import "./Game.css"

export function Game({ game, path }: { game: GameDetails; path: string }) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const updateTitle = (title: string) => {
    storageContext.updateItem<GameDetails>(path, {
      ...game,
      title,
    })
  }

  const updateStatus = (status: GameDetails["status"]) => {
    storageContext.updateItem<GameDetails>(path, {
      ...game,
      status,
    })
  }

  const deleteGame = () => {
    storageContext.deleteItem(path, game)
  }

  return (
    <li className="game">
      <Checkbox
        isChecked={game.status === "done"}
        onChange={() => updateStatus(game.status === "done" ? null : "done")}
        aria-label="is played"
      />
      <div className={`details ${game.status}`}>
        <EditableText label="title" onChange={updateTitle}>
          {game.title}
        </EditableText>
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
