import { useRef, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import {
  GameDetails,
  GAMES_KEY,
  ReadingItemDetails,
  SeriesDetails,
} from "../types"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { SubmitButton } from "../SubmitButton"
import { useStorageContext } from "../../../shared/FirebaseContext"

export function AddGameForm() {
  const titleRef = useRef<HTMLInputElement>(null)
  const [series, setSeries] = useState<OptionType>()

  const { useValue, addItem } = useStorageContext()

  const { value } = useValue<Record<string, ReadingItemDetails>>(GAMES_KEY)
  const seriesOptions = value
    ? Object.values(value)
        .filter((item) => item.type === "series")
        .map((series) => ({ id: series.id, label: series.name }))
    : []

  const createParentItem = <T extends SeriesDetails<GameDetails>>(
    item: T,
    path: string,
  ) => {
    const id =
      item.id === ""
        ? addItem(path, {
            type: item.type,
            name: item.name,
          })
        : item.id

    return `${path}/${id}/items`
  }

  const createItem = (event: React.FormEvent) => {
    event.preventDefault()

    const title = titleRef.current?.value
    if (!title) return

    let path = GAMES_KEY

    if (series) {
      path = createParentItem(
        {
          id: series.id,
          type: "series",
          name: series.label,
        },
        path,
      )
    }

    addItem<GameDetails>(path, {
      type: "game",
      title,
    })
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
