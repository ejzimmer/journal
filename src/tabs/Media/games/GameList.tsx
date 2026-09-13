import { Game } from "./Game"
import { GameDetails } from "../types"

export function GameList({
  games,
  bandHue,
  seriesId,
}: {
  games?: Record<string, GameDetails>
  bandHue?: number
  seriesId?: string
}) {
  const gameDetails = games ? Object.values(games) : undefined

  return (
    gameDetails && (
      <ul className="matched-set">
        {gameDetails.map((game) => (
          <Game
            key={game.id}
            game={game}
            bandHue={bandHue}
            seriesId={seriesId}
          />
        ))}
      </ul>
    )
  )
}
