import { useRef, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { NewGame } from "../types"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { SubmitButton } from "../SubmitButton"
import { useMediaStorage } from "../MediaStorageContext"

export function AddGameForm() {
  const titleRef = useRef<HTMLInputElement>(null)
  const [series, setSeries] = useState<OptionType>()

  const { gameSeries, addMedia, addMediaSeries } = useMediaStorage()

  const seriesOptions = gameSeries.map((series) => ({
    id: series.id,
    label: series.name,
  }))

  const createItem = (event: React.FormEvent) => {
    event.preventDefault()

    const title = titleRef.current?.value
    if (!title) return

    const game: NewGame = { type: "game", title }

    if (series && series.id === "") {
      addMediaSeries(series.label, game)
    } else if (series) {
      addMedia(game, series.id)
    } else {
      addMedia(game)
    }

    ;(event.target as HTMLFormElement).reset()
    setSeries(undefined)
  }

  return (
    <form onSubmit={createItem} className="create-new">
      <FormControl label="Game title" ref={titleRef} />
      <Combobox
        label="Series name"
        value={series}
        options={seriesOptions}
        createOption={(label) => ({ id: "", label })}
        onChange={setSeries}
      />
      <SubmitButton label="Create" />
    </form>
  )
}
