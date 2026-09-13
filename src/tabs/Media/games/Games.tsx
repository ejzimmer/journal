import { isSeries } from "../types"
import { Game } from "./Game"
import { Series } from "./Series"
import { AddGameForm } from "./AddGameForm"
import { useMediaStorage } from "../MediaStorageContext"

export function Games() {
  const { games } = useMediaStorage()

  const series = games.filter(isSeries)
  const singles = games.filter((item) => !isSeries(item))

  return (
    <div className="games">
      <h2>Games</h2>
      <div className="case">
        {series.map((item) => (
          <Series key={item.id} series={item} />
        ))}
        {singles.length > 0 && (
          <div className="run singles">
            <ul className="run-books">
              {singles.map((game) => (
                <Game key={game.id} game={game} />
              ))}
            </ul>
          </div>
        )}
      </div>
      <AddGameForm />
    </div>
  )
}
