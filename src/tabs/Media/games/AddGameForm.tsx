import { useRef, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { NewGame } from "../types"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { FormModal } from "../../../shared/controls/FormModal"
import { useMediaStorage } from "../MediaStorageContext"

export function AddGameForm() {
  const titleRef = useRef<HTMLInputElement>(null)
  const [series, setSeries] = useState<OptionType>()

  const { gameSeries, addMedia, addMediaSeries } = useMediaStorage()

  const seriesOptions = gameSeries.map((series) => ({
    id: series.id,
    label: series.name,
  }))

  const createGame = () => {
    const title = titleRef.current?.value
    if (!title) return false

    const game: NewGame = { type: "game", title }

    if (series && series.id === "") {
      addMediaSeries(series.label, game)
    } else if (series) {
      addMedia(game, series.id)
    } else {
      addMedia(game)
    }

    setSeries(undefined)
    return true
  }

  return (
    <FormModal
      trigger={(props) => (
        <button {...props} className="outline icon" aria-label="Add a game">
          +
        </button>
      )}
      onSubmit={createGame}
      submitButtonText="Add a game"
    >
      <FormControl label="Game title" ref={titleRef} />
      <Combobox
        label="Series name"
        value={series}
        options={seriesOptions}
        createOption={(label) => ({ id: "", label })}
        onChange={setSeries}
      />
    </FormModal>
  )
}
