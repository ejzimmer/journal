import { useContext, useRef, useState } from "react"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import {
  SeriesDetails,
  GAMES_KEY,
  GameDetails,
  PlayingItemDetails,
} from "../types"

export function AddGameForm() {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const gameRef = useRef<HTMLInputElement>(null)
  const [series, setSeries] = useState<{
    text: string
    value?: SeriesDetails<GameDetails>
  }>()

  const { value } = storageContext.useValue<PlayingItemDetails>(GAMES_KEY)
  const items = value ? Object.values(value) : []

  const serieses = items.filter((item) => item.type === "series")

  const onCreateItem = (event: React.FormEvent) => {
    event.preventDefault()
    const game = gameRef.current?.value
    if (!game) {
      return
    }

    const newGame: Omit<GameDetails, "id"> = { title: game, type: "game" }
    const addGameTo = (key: string) =>
      storageContext.addItem<GameDetails>(key, newGame)
    const createSeries = (key: string, name: string) =>
      storageContext.addItem<SeriesDetails<GameDetails>>(key, {
        name,
        type: "series",
      })
    if (series) {
      const seriesKey =
        series.value && value?.[series.value.id]
          ? series.value.id
          : createSeries(GAMES_KEY, series.text)
      addGameTo(`${GAMES_KEY}/${seriesKey}/items`)
    } else {
      addGameTo(GAMES_KEY)
    }

    setSeries(undefined)
    gameRef.current?.form?.reset()
  }

  return (
    <form onSubmit={onCreateItem}>
      <input aria-label="book" ref={gameRef} />
      <Combobox
        label="series"
        options={serieses.map((series) => ({
          text: series.name,
          id: series.id,
          value: series,
        }))}
        value={series}
        createOption={(text) => ({ text })}
        onChange={setSeries}
      />
      <button type="submit">submit</button>
    </form>
  )
}
