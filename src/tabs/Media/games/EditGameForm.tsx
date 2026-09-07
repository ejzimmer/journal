import { useState } from "react"
import { FormModal } from "../../../shared/controls/FormModal"
import { FormControl } from "../../../shared/controls/FormControl"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { StatusField } from "../StatusField"
import { useMediaStorage } from "../MediaStorageContext"
import { GameDetails, ListParent, MediaList } from "../types"
import {
  convertFromGameStatus,
  GAME_STATUS_OPTIONS,
  getGameStatus,
} from "./status"

type EditGameFormProps = {
  game: GameDetails
  list: MediaList
}

const convertToOption = ({ id, name }: ListParent) => ({ id, label: name })

const convertToListParent = (option?: OptionType) =>
  option && { id: option.id, name: option.label }

export function EditGameForm({ game, list }: EditGameFormProps) {
  const { getSeriesInList, removeFromList, moveToList } = useMediaStorage()

  const [title, setTitle] = useState(game.title)
  const [status, setStatus] = useState(getGameStatus(game))
  const [series, setSeries] = useState(
    list.series && convertToOption(list.series),
  )

  const fillFieldsFromGame = () => {
    setTitle(game.title)
    setStatus(getGameStatus(game))
    setSeries(list.series && convertToOption(list.series))
  }

  const save = () => {
    if (!title.trim()) {
      removeFromList(list, game)
      return true
    }

    const updated: GameDetails = {
      ...game,
      title: title.trim(),
      ...convertFromGameStatus(status),
    }

    moveToList(updated, list, {
      root: "games",
      series: convertToListParent(series),
    })
    return true
  }

  return (
    <FormModal
      trigger={({ onClick }) => (
        <button
          type="button"
          className="media-title"
          onClick={() => {
            fillFieldsFromGame()
            onClick()
          }}
        >
          {game.title}
        </button>
      )}
      onSubmit={save}
      submitButtonText="Save"
    >
      <FormControl label="Title" value={title} onChange={setTitle} />
      <StatusField
        legend="Status"
        options={GAME_STATUS_OPTIONS}
        value={status}
        onChange={setStatus}
      />
      <Combobox
        label="Series"
        value={series}
        options={getSeriesInList({ root: "games" }).map(convertToOption)}
        createOption={(label) => ({ id: "", label })}
        onChange={setSeries}
      />
    </FormModal>
  )
}
