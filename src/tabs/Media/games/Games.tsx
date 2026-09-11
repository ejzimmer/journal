import { Fragment } from "react"
import { AddGameForm } from "./AddGameForm"
import { PlayingItemDetails } from "../types"
import { Game } from "./Game"
import { Series } from "./Series"
import { useMediaStorage } from "../MediaStorageContext"

function getComponent<T extends PlayingItemDetails>(item: T) {
  switch (item.type) {
    case "game":
      return <Game game={item} />
    case "series":
      return <Series series={item} />
  }
}

export function Games() {
  const { games } = useMediaStorage()

  return (
    <div className="games">
      <h2>Games</h2>
      <ul>
        {games.map((item) => (
          <Fragment key={item.id}>{getComponent(item)}</Fragment>
        ))}
      </ul>
      <AddGameForm />
    </div>
  )
}
