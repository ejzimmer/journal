import { useRef, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { GameDetails } from "../types"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { SubmitButton } from "../SubmitButton"
import { useMediaStorage } from "../MediaStorageContext"

const toParent = (option?: OptionType) =>
  option && { id: option.id, name: option.label }

export function AddGameForm() {
  const titleRef = useRef<HTMLInputElement>(null)
  const [series, setSeries] = useState<OptionType>()

  const { seriesIn, addToList } = useMediaStorage()

  const createItem = (event: React.FormEvent) => {
    event.preventDefault()

    const title = titleRef.current?.value
    if (!title) return

    addToList<GameDetails>(
      { root: "games", series: toParent(series) },
      { type: "game", title },
    )
    ;(event.target as HTMLFormElement).reset()
    setSeries(undefined)
  }

  return (
    <form onSubmit={createItem} className="create-new">
      <FormControl label="Game title" ref={titleRef} />
      <Combobox
        label="Series name"
        value={series}
        options={seriesIn({ root: "games" }).map(({ id, name }) => ({
          id,
          label: name,
        }))}
        createOption={(label) => ({ id: "", label })}
        onChange={setSeries}
      />
      <SubmitButton label="Create" />
    </form>
  )
}
