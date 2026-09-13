import { FormEvent, useRef, useState } from "react"
import { FormControl } from "../../shared/controls/FormControl"
import { Combobox } from "../../shared/controls/combobox/Combobox"
import { OptionType } from "../../shared/controls/combobox/types"
import { Modal, useModal } from "../../shared/controls/Modal"
import { ModalDialog } from "../../shared/controls/ModalDialog"
import { BandColourPicker } from "./BandColourPicker"
import { useMediaStorage } from "./MediaStorageContext"
import { MediaDetails, MediaSeries, NewMedia, SeriesDetails } from "./types"

export type MediaFormConfig<T extends MediaDetails> = {
  typeLabel: string
  seriesList: SeriesDetails<T>[]
  authorOptions?: string[]
  getAuthor?: (item: T) => string | undefined
  buildNew: (title: string, author?: string) => Omit<T, "id">
  buildUpdated: (item: T, title: string, author?: string) => T
}

export function MediaForm<T extends MediaDetails>({
  item,
  config,
}: {
  item?: T
  config: MediaFormConfig<T>
}) {
  const titleRef = useRef<HTMLInputElement>(null)
  const existingAuthor = item && config.getAuthor?.(item)
  const [author, setAuthor] = useState<OptionType | undefined>(
    existingAuthor
      ? { id: existingAuthor, label: existingAuthor }
      : undefined,
  )

  const {
    addMedia,
    addMediaSeries,
    updateMedia,
    updateMediaSeries,
    moveMedia,
    deleteMedia,
  } = useMediaStorage()
  const { closeModal } = useModal()

  const currentSeries = item
    ? config.seriesList.find((series) => item.id in (series.items ?? {}))
    : undefined

  const [series, setSeries] = useState<OptionType | undefined>(
    currentSeries
      ? { id: currentSeries.id, label: currentSeries.name }
      : undefined,
  )
  const [bandHue, setBandHue] = useState(currentSeries?.bandHue)

  const changeSeries = (value?: OptionType) => {
    setSeries(value)
    const matchedSeries =
      value && config.seriesList.find((s) => s.id === value.id)
    setBandHue(matchedSeries?.bandHue)
  }

  const updateSeriesBandHue = (target: SeriesDetails<T> | undefined) => {
    if (target && bandHue !== undefined && bandHue !== target.bandHue) {
      updateMediaSeries(target as MediaSeries, target.name, bandHue)
    }
  }

  const resetSeriesBand = () => {
    setSeries(undefined)
    setBandHue(undefined)
  }

  const seriesOptions = config.seriesList.map((s) => ({
    id: s.id,
    label: s.name,
  }))

  const authorOptions = (config.authorOptions ?? []).map((name) => ({
    id: name,
    label: name,
  }))

  const saveItem = (event: FormEvent) => {
    event.preventDefault()

    const title = titleRef.current?.value
    if (!title) return

    if (item) {
      const updatedItem = config.buildUpdated(item, title, author?.label)

      if (series && series.id === "") {
        moveMedia(updatedItem, { name: series.label, bandHue })
      } else if (series?.id !== currentSeries?.id) {
        moveMedia(updatedItem, series && { id: series.id })
        const target = series && config.seriesList.find((s) => s.id === series.id)
        updateSeriesBandHue(target)
      } else {
        updateMedia(updatedItem)
        updateSeriesBandHue(currentSeries)
      }
    } else {
      const newItem = config.buildNew(title, author?.label) as NewMedia

      if (series && series.id === "") {
        addMediaSeries(series.label, newItem, bandHue)
      } else if (series) {
        addMedia(newItem, series.id)
        updateSeriesBandHue(config.seriesList.find((s) => s.id === series.id))
      } else {
        addMedia(newItem)
      }

      if (titleRef.current) titleRef.current.value = ""
      setAuthor(undefined)
      resetSeriesBand()
    }

    closeModal()
  }

  const removeItem = () => {
    if (item) deleteMedia(item)
  }

  return (
    <form onSubmit={saveItem}>
      <Modal.Body>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <FormControl
            label={`${config.typeLabel} title`}
            ref={titleRef}
            defaultValue={item?.title}
          />
          {config.authorOptions && (
            <Combobox
              label="Author name"
              value={author}
              options={authorOptions}
              createOption={(label) => ({ id: "", label })}
              onChange={setAuthor}
            />
          )}
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
        {item && (
          <Modal.Action onClick={removeItem} className="danger">
            Delete {config.typeLabel.toLowerCase()}
          </Modal.Action>
        )}
        <Modal.Cancel>Cancel</Modal.Cancel>
        <Modal.Action className="primary">Save</Modal.Action>
      </Modal.Footer>
    </form>
  )
}

export function AddMediaForm<T extends MediaDetails>({
  ariaLabel,
  config,
}: {
  ariaLabel: string
  config: MediaFormConfig<T>
}) {
  return (
    <Modal
      trigger={(props) => (
        <button {...props} className="outline icon" aria-label={ariaLabel}>
          +
        </button>
      )}
    >
      <MediaForm config={config} />
    </Modal>
  )
}

export function EditMediaForm<T extends MediaDetails>({
  item,
  isOpen,
  onCancel,
  config,
}: {
  item: T
  isOpen: boolean
  onCancel: () => void
  config: MediaFormConfig<T>
}) {
  return (
    <ModalDialog isOpen={isOpen} onCancel={onCancel}>
      {isOpen && <MediaForm item={item} config={config} />}
    </ModalDialog>
  )
}
