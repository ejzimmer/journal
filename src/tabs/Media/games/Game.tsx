import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { GameDetails } from "../types"

import { XIcon } from "../../../shared/icons/X"
import { EditableText } from "../../../shared/controls/EditableText"
import { Checkbox } from "../../../shared/controls/Checkbox"

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
    <li>
      <Checkbox
        isChecked={!!game.isDone}
        onChange={toggleDone}
        aria-label="is played"
      />
      <div style={{ flexGrow: 1 }}>
        <EditableText label="title" onChange={updateTitle}>
          {game.title}
        </EditableText>
      </div>
      <button className="emoji ghost" onClick={deleteGame}>
        <XIcon width="16px" />
      </button>
    </li>
  )
}
