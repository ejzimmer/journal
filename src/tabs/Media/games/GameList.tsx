import { Game } from "./Game"
import { GameDetails } from "../types"

export function GameList({
  games,
  band,
}: {
  games?: Record<string, GameDetails>
  band?: number
}) {
  const gameDetails = games ? Object.values(games) : undefined

  return (
    gameDetails && (
      <ul className="ser-set">
        {gameDetails.map((game) => (
          <Game key={game.id} game={game} band={band} />
        ))}
      </ul>
    )
  )
}
