import { Fragment, useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { AddGameForm } from "./AddGameForm"
import { GAMES_KEY, PlayingItemDetails } from "../types"
import { Game } from "./Game"
import { Series } from "./Series"

function getComponent<T extends PlayingItemDetails>(item: T) {
  switch (item.type) {
    case "game":
      return <Game game={item} path={GAMES_KEY} />
    case "series":
      return <Series series={item} path={GAMES_KEY} />
  }
}

export function Games() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const { value } = storageContext.useValue<PlayingItemDetails>(GAMES_KEY)
  const items = value ? Object.values(value) : []

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
