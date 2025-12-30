import { useContext, useRef } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { Game } from "./Game"
import { GameDetails, GAMES_KEY } from "../types"

export function GameList({
  games,
  path,
}: {
  games?: Record<string, GameDetails>
  path: string
}) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const gameDetails = games ? Object.values(games) : undefined
  const newGameRef = useRef<HTMLInputElement>(null)

  const addGame = (event: React.FormEvent) => {
    event.preventDefault()

    if (newGameRef.current?.value) {
      storageContext.addItem<GameDetails>(`${GAMES_KEY}/${path}/games`, {
        title: newGameRef.current?.value,
        type: "game",
      })
      newGameRef.current.form?.reset()
    }
  }

  return (
    gameDetails && (
      <ul>
        {gameDetails.map((game) => (
          <Game game={game} path={`${GAMES_KEY}/${path}/games`} />
        ))}
        <form onSubmit={addGame}>
          <input className="add-item-to-list" ref={newGameRef} />
        </form>
      </ul>
    )
  )
}
