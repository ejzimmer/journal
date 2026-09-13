import { useRef } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { GameDetails, NewGame } from "../types"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { Modal, useModal } from "../../../shared/controls/Modal"
import { useMediaStorage } from "../MediaStorageContext"
import { useSeriesBand } from "../useSeriesBand"
import { BandColourPicker } from "../BandColourPicker"

export function GameForm({ game }: { game?: GameDetails }) {
  const titleRef = useRef<HTMLInputElement>(null)

  const {
    gameSeries,
    addMedia,
    addMediaSeries,
    updateMedia,
    moveMedia,
    deleteMedia,
  } = useMediaStorage()
  const { closeModal } = useModal()

  const {
    currentSeries,
    series,
    bandHue,
    setBandHue,
    changeSeries,
    updateSeriesBandHue,
    reset: resetSeriesBand,
    seriesOptions,
  } = useSeriesBand(game, gameSeries)

  const saveGame = (event: React.FormEvent) => {
    event.preventDefault()

    const title = titleRef.current?.value
    if (!title) return

    if (game) {
      const updatedGame: GameDetails = { ...game, title }

      if (series && series.id === "") {
        moveMedia(updatedGame, { name: series.label, bandHue })
      } else if (series?.id !== currentSeries?.id) {
        moveMedia(updatedGame, series && { id: series.id })
        const target = series && gameSeries.find((s) => s.id === series.id)
        updateSeriesBandHue(target)
      } else {
        updateMedia(updatedGame)
        updateSeriesBandHue(currentSeries)
      }
    } else {
      const newGame: NewGame = { type: "game", title }

      if (series && series.id === "") {
        addMediaSeries(series.label, newGame, bandHue)
      } else if (series) {
        addMedia(newGame, series.id)
        updateSeriesBandHue(gameSeries.find((s) => s.id === series.id))
      } else {
        addMedia(newGame)
      }

      if (titleRef.current) titleRef.current.value = ""
      resetSeriesBand()
    }

    closeModal()
  }

  const removeGame = () => {
    if (game) deleteMedia(game)
  }

  return (
    <form onSubmit={saveGame}>
      <Modal.Body>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <FormControl
            label="Game title"
            ref={titleRef}
            defaultValue={game?.title}
          />
          <Combobox
            label="Series name"
            value={series}
            options={seriesOptions}
            createOption={(label) => ({ id: "", label })}
            onChange={changeSeries}
          />
          {series && (
            <BandColourPicker
              label={`${series.label} band colour`}
              value={bandHue}
              onChange={setBandHue}
            />
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        {game && (
          <Modal.Action onClick={removeGame} className="danger">
            Delete game
          </Modal.Action>
        )}
        <Modal.Cancel>Cancel</Modal.Cancel>
        <Modal.Action className="primary">Save</Modal.Action>
      </Modal.Footer>
    </form>
  )
}
