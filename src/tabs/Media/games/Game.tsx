import { useContext } from "react"
import { EmojiCheckbox } from "../../../shared/controls/EmojiCheckbox"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { GameDetails } from "../types"

import "./Game.css"
import { XIcon } from "../../../shared/icons/X"
import { EditableText } from "../../../shared/controls/EditableText"

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

  const toggleDone = () => {
    storageContext.updateItem<GameDetails>(path, {
      ...game,
      isDone: !game.isDone,
    })
  }

  const deleteGame = () => {
    storageContext.deleteItem(path, game)
  }

  return (
    <div className="game">
      <EditableText label="title" onChange={updateTitle}>
        {game.title}
      </EditableText>
      <EmojiCheckbox
        emoji="✅"
        isChecked={!!game.isDone}
        onChange={toggleDone}
        label="done"
      />
      <button className="emoji ghost" onClick={deleteGame}>
        <XIcon width="16px" />
      </button>
    </div>
  )
}
