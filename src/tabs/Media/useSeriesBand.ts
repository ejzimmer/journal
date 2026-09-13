import { useState } from "react"
import { OptionType } from "../../shared/controls/combobox/types"
import { MediaDetails, MediaSeries, SeriesDetails } from "./types"
import { useMediaStorage } from "./MediaStorageContext"

export function useSeriesBand<T extends MediaDetails>(
  item: T | undefined,
  seriesList: SeriesDetails<T>[],
) {
  const { updateMediaSeries } = useMediaStorage()

  const currentSeries = item
    ? seriesList.find((series) => item.id in (series.items ?? {}))
    : undefined

  const [series, setSeries] = useState<OptionType | undefined>(
    currentSeries
      ? { id: currentSeries.id, label: currentSeries.name }
      : undefined,
  )
  const [bandHue, setBandHue] = useState(currentSeries?.bandHue)

  const changeSeries = (value?: OptionType) => {
    setSeries(value)
    const matchedSeries = value && seriesList.find((s) => s.id === value.id)
    setBandHue(matchedSeries?.bandHue)
  }

  const updateSeriesBandHue = (target: SeriesDetails<T> | undefined) => {
    if (target && bandHue !== undefined && bandHue !== target.bandHue) {
      updateMediaSeries(target as MediaSeries, target.name, bandHue)
    }
  }

  const reset = () => {
    setSeries(undefined)
    setBandHue(undefined)
  }

  return {
    currentSeries,
    series,
    bandHue,
    setBandHue,
    changeSeries,
    updateSeriesBandHue,
    reset,
    seriesOptions: seriesList.map((s) => ({ id: s.id, label: s.name })),
  }
}
