import { Fragment } from "react"
import { AddGameForm } from "./AddGameForm"
import { MediaList, PlayingItemDetails } from "../types"
import { Game } from "./Game"
import { Series } from "./Series"
import { useMediaStorage } from "../MediaStorageContext"

const GAMES: MediaList = { root: "games" }

function getComponent<T extends PlayingItemDetails>(item: T) {
  switch (item.type) {
    case "game":
      return <Game game={item} list={GAMES} />
    case "series":
      return <Series series={item} />
  }
}

export function Games() {
  const { games } = useMediaStorage()
  const items = Object.values(games ?? {})

  return (
    <div className="games">
      <h2>Games</h2>
      <ul>
        {items.map((item) => (
          <Fragment key={item.id}>{getComponent(item)}</Fragment>
        ))}
      </ul>
      <AddGameForm />
    </div>
  )
}
