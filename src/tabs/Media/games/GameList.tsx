import { Game } from "./Game"
import { GameDetails } from "../types"

export function GameList({
  games,
  path,
}: {
  games?: Record<string, GameDetails>
  path: string
}) {
  const gameDetails = games ? Object.values(games) : undefined

  return (
    gameDetails && (
      <ul>
        {gameDetails.map((game) => (
          <Game key={game.id} game={game} path={path} />
        ))}
      </ul>
    )
  )
}
