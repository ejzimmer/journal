import { useEffect } from "react"
import { getRandomBandHue } from "./bandHue"
import { useMediaStorage } from "./MediaStorageContext"

export function useBandHueMigration() {
  const { bookSeries, gameSeries, updateMediaSeries } = useMediaStorage()

  useEffect(() => {
    ;[...bookSeries, ...gameSeries]
      .filter((series) => series.bandHue === undefined)
      .forEach((series) =>
        updateMediaSeries(series, series.name, getRandomBandHue()),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookSeries, gameSeries])
}
