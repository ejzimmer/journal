import { useRef, useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { GameDetails, NewGame, SeriesDetails } from "../types"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { OptionType } from "../../../shared/controls/combobox/types"
import { Modal, useModal } from "../../../shared/controls/Modal"
import { useMediaStorage } from "../MediaStorageContext"
import { BandColourPicker } from "../BandColourPicker"
import { getRandomBandHue } from "../bandHue"

export function GameForm({ game }: { game?: GameDetails }) {
  const titleRef = useRef<HTMLInputElement>(null)

  const {
    gameSeries,
    addMedia,
    addMediaSeries,
    updateMedia,
    updateMediaSeries,
    moveMedia,
    deleteMedia,
  } = useMediaStorage()
  const { closeModal } = useModal()

  const currentSeries = game
    ? gameSeries.find((series) => game.id in (series.items ?? {}))
    : undefined

  const [series, setSeries] = useState<OptionType | undefined>(
    currentSeries
      ? { id: currentSeries.id, label: currentSeries.name }
      : undefined,
  )
  const [band, setBand] = useState(currentSeries?.band ?? getRandomBandHue())
  const [hasPickedBand, setHasPickedBand] = useState(false)

  const seriesOptions = gameSeries.map((series) => ({
    id: series.id,
    label: series.name,
  }))

  const changeSeries = (value?: OptionType) => {
    setSeries(value)
    const matchedSeries = value && gameSeries.find((s) => s.id === value.id)
    if (matchedSeries?.band !== undefined) setBand(matchedSeries.band)
  }

  const changeBand = (hue: number) => {
    setBand(hue)
    setHasPickedBand(true)
  }

  const persistBand = (target: SeriesDetails<GameDetails> | undefined) => {
    if (target && hasPickedBand) updateMediaSeries(target, target.name, band)
  }

  const saveGame = (event: React.FormEvent) => {
    event.preventDefault()

    const title = titleRef.current?.value
    if (!title) return

    if (game) {
      const updatedGame: GameDetails = { ...game, title }

      if (series && series.id === "") {
        moveMedia(updatedGame, { name: series.label, band })
      } else if (series?.id !== currentSeries?.id) {
        moveMedia(updatedGame, series && { id: series.id })
        persistBand(series && gameSeries.find((s) => s.id === series.id))
      } else {
        updateMedia(updatedGame)
        persistBand(currentSeries)
      }
    } else {
      const newGame: NewGame = { type: "game", title }

      if (series && series.id === "") {
        addMediaSeries(series.label, newGame, band)
      } else if (series) {
        addMedia(newGame, series.id)
        persistBand(gameSeries.find((s) => s.id === series.id))
      } else {
        addMedia(newGame)
      }

      if (titleRef.current) titleRef.current.value = ""
      setSeries(undefined)
      setBand(getRandomBandHue())
      setHasPickedBand(false)
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
              value={band}
              onChange={changeBand}
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
