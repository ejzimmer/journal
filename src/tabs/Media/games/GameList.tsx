import { Game } from "./Game"
import { GameDetails, MediaList } from "../types"

export function GameList({
  games,
  list,
}: {
  games?: Record<string, GameDetails>
  list: MediaList
}) {
  const gameDetails = games ? Object.values(games) : undefined

  return (
    gameDetails && (
      <ul>
        {gameDetails.map((game) => (
          <Game key={game.id} game={game} list={list} />
        ))}
      </ul>
    )
  )
}
