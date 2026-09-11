import { Game } from "./Game"
import { GameDetails } from "../types"

export function GameList({ games }: { games?: Record<string, GameDetails> }) {
  const gameDetails = games ? Object.values(games) : undefined

  return (
    gameDetails && (
      <ul>
        {gameDetails.map((game) => (
          <Game key={game.id} game={game} />
        ))}
      </ul>
    )
  )
}
