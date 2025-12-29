import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { AddGameForm } from "./AddGameForm"
import { GameDetails, GAMES_KEY, SeriesDetails } from "../types"
import { Game } from "./Game"
import { Series } from "./Series"

function getComponent<T extends SeriesDetails | GameDetails>(item: T) {
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

  const { value } = storageContext.useValue<SeriesDetails | GameDetails>(
    GAMES_KEY
  )
  const items = value ? Object.values(value) : []

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h2>Games</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{getComponent(item)}</li>
        ))}
      </ul>
      <AddGameForm />
    </div>
  )
}
