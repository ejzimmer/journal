import { isSeries } from "../types"
import { Game } from "./Game"
import { Series } from "./Series"
import { AddGameForm } from "./AddGameForm"
import { useMediaStorage } from "../MediaStorageContext"

export function Games() {
  const { games } = useMediaStorage()

  return (
    <div className="games">
      <h2>Games</h2>
      <div className="shelves">
        {games.map((item) =>
          isSeries(item) ? (
            <Series key={item.id} series={item} />
          ) : (
            <div className="shelf" key={item.id}>
              <ul className="spines">
                <Game game={item} />
              </ul>
            </div>
          ),
        )}
      </div>
      <AddGameForm />
    </div>
  )
}
