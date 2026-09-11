import { useEffect, useRef, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { GameDetails } from "../types"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { Modal, useModal } from "../../../shared/controls/Modal"
import { ModalDialog } from "../../../shared/controls/ModalDialog"
import { useMediaStorage } from "../MediaStorageContext"

export function EditGameForm({
  game,
  isOpen,
  onCancel,
}: {
  game: GameDetails
  isOpen: boolean
  onCancel: () => void
}) {
  return (
    <ModalDialog isOpen={isOpen} onCancel={onCancel}>
      <EditGameFormFields game={game} isOpen={isOpen} />
    </ModalDialog>
  )
}

function EditGameFormFields({
  game,
  isOpen,
}: {
  game: GameDetails
  isOpen: boolean
}) {
  const titleRef = useRef<HTMLInputElement>(null)
  const [series, setSeries] = useState<OptionType>()

  const { gameSeries, updateMedia, moveMedia, moveMediaToNewSeries, deleteMedia } =
    useMediaStorage()
  const { closeModal } = useModal()

  const seriesOptions = gameSeries.map((series) => ({
    id: series.id,
    label: series.name,
  }))
  const currentSeries = gameSeries.find(
    (series) => game.id in (series.items ?? {}),
  )

  useEffect(() => {
    if (!isOpen) return

    if (titleRef.current) titleRef.current.value = game.title
    setSeries(
      currentSeries
        ? { id: currentSeries.id, label: currentSeries.name }
        : undefined,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const saveGame = (event: React.FormEvent) => {
    event.preventDefault()

    const title = titleRef.current?.value
    if (!title) return

    const updatedGame: GameDetails = { ...game, title }

    if (series && series.id === "") {
      moveMediaToNewSeries(updatedGame, series.label)
    } else if (series?.id !== currentSeries?.id) {
      moveMedia(updatedGame, series?.id)
    } else {
      updateMedia(updatedGame)
    }

    closeModal()
  }

  const removeGame = () => {
    deleteMedia(game)
  }

  return (
    <form onSubmit={saveGame}>
      <Modal.Body>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <FormControl label="Game title" ref={titleRef} />
          <Combobox
            label="Series name"
            value={series}
            options={seriesOptions}
            createOption={(label) => ({ id: "", label })}
            onChange={setSeries}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Modal.Action onClick={removeGame} className="danger">
          Delete game
        </Modal.Action>
        <Modal.Cancel>Cancel</Modal.Cancel>
        <Modal.Action className="primary">Save</Modal.Action>
      </Modal.Footer>
    </form>
  )
}
