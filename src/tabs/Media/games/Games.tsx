import { isSeries } from "../types"
import { GameList } from "./GameList"
import { AddGameForm } from "./AddGameForm"
import { Shelf } from "../Shelf"
import { useMediaStorage } from "../MediaStorageContext"

export function Games() {
  const { games, updateMediaSeries } = useMediaStorage()

  return (
    <div className="games">
      <h2>Games</h2>
      <div className="shelves">
        {games.map((item) =>
          isSeries(item) ? (
            <Shelf
              key={item.id}
              label={item.name}
              onRenameLabel={(name) => updateMediaSeries(item, name)}
            >
              <GameList
                games={item.items}
                bandHue={item.bandHue}
                seriesId={item.id}
              />
            </Shelf>
          ) : (
            <Shelf key={item.id}>
              <GameList games={{ [item.id]: item }} />
            </Shelf>
          ),
        )}
      </div>
      <AddGameForm />
    </div>
  )
}
