import { createContext, ReactNode, useContext, useMemo } from "react"
import { useStorageContext } from "../../shared/FirebaseContext"
import {
  BookDetails,
  BOOKS_KEY,
  GameDetails,
  GAMES_KEY,
  isSeries,
  MediaDetails,
  MediaSeries,
  NewMedia,
  PlayingItemDetails,
  ReadingItemDetails,
  SeriesDetails,
} from "./types"

export type MediaStorageContextType = {
  books: ReadingItemDetails[]
  games: PlayingItemDetails[]
  bookSeries: SeriesDetails<BookDetails>[]
  gameSeries: SeriesDetails<GameDetails>[]
  authors: string[]
  isLoading: boolean

  addMedia: (media: NewMedia, seriesId?: string) => void
  addMediaSeries: (name: string, media: NewMedia) => void
  updateMedia: (media: MediaDetails) => void
  updateMediaSeries: (series: MediaSeries, name: string) => void
  deleteMedia: (media: MediaDetails) => void
  moveMedia: (
    media: MediaDetails,
    destination?: { id: string } | { name: string },
  ) => void
}

const getMediaKey = (type: MediaDetails["type"]) =>
  type === "book" ? BOOKS_KEY : GAMES_KEY

function listAuthors(books: ReadingItemDetails[]) {
  const authors = new Set<string>()

  books.forEach((entry) => {
    const entryBooks = isSeries(entry)
      ? Object.values(entry.items ?? {})
      : [entry]
    entryBooks.forEach(({ author }) => author && authors.add(author))
  })

  return [...authors]
}

export const MediaStorageContext = createContext<
  MediaStorageContextType | undefined
>(undefined)

export function MediaStorageProvider({ children }: { children: ReactNode }) {
  const { addItem, updateItem, deleteItem, useValue } = useStorageContext()

  const { value: storedBooks, loading: booksLoading } =
    useValue<Record<string, ReadingItemDetails>>(BOOKS_KEY)
  const { value: storedGames, loading: gamesLoading } =
    useValue<Record<string, PlayingItemDetails>>(GAMES_KEY)

  const books = useMemo(() => Object.values(storedBooks ?? {}), [storedBooks])
  const games = useMemo(() => Object.values(storedGames ?? {}), [storedGames])

  const bookSeries = useMemo(
    () => books.filter((book) => isSeries(book)),
    [books],
  )
  const gameSeries = useMemo(
    () => games.filter((game) => isSeries(game)),
    [games],
  )

  const authors = useMemo(() => listAuthors(books), [books])

  const findSeriesContaining = (media: MediaDetails) => {
    const series = media.type === "book" ? bookSeries : gameSeries
    return series.find((entry) => media.id in (entry.items ?? {}))
  }

  const deleteMediaFromSeries = (series: MediaSeries, media: MediaDetails) => {
    const key = getMediaKey(media.type)
    const isLastInSeries = Object.keys(series.items ?? {}).length <= 1
    if (isLastInSeries) {
      deleteItem(key, series)
    } else {
      deleteItem(`${key}/${series.id}/items`, media)
    }
  }

  const getMediaPath = (type: MediaDetails["type"], seriesId?: string) => {
    const key = getMediaKey(type)
    return seriesId ? `${key}/${seriesId}/items` : key
  }

  const value: MediaStorageContextType = {
    books,
    games,
    bookSeries,
    gameSeries,
    authors,
    isLoading: booksLoading || gamesLoading,

    addMedia: (media, seriesId) => {
      addItem(getMediaPath(media.type, seriesId), media)
    },
    addMediaSeries: (name, media) => {
      const key = getMediaKey(media.type)
      const seriesId = addItem<MediaSeries>(key, { type: "series", name })
      addItem(`${key}/${seriesId}/items`, media)
    },
    updateMedia: (media) => {
      const currentSeries = findSeriesContaining(media)
      updateItem(getMediaPath(media.type, currentSeries?.id), media)
    },
    updateMediaSeries: (series, name) => {
      const key = bookSeries.some((entry) => entry.id === series.id)
        ? BOOKS_KEY
        : GAMES_KEY
      updateItem(key, { ...series, name })
    },
    deleteMedia: (media) => {
      const series = findSeriesContaining(media)
      if (series) {
        deleteMediaFromSeries(series, media)
      } else {
        deleteItem(getMediaKey(media.type), media)
      }
    },
    moveMedia: (media, destination) => {
      if (destination && "name" in destination) {
        const key = getMediaKey(media.type)
        const seriesId = addItem<MediaSeries>(key, {
          type: "series",
          name: destination.name,
        })
        moveMediaToSeriesId(media, seriesId ?? undefined)
      } else {
        moveMediaToSeriesId(media, destination?.id)
      }
    },
  }

  function moveMediaToSeriesId(media: MediaDetails, seriesId?: string) {
    const currentSeries = findSeriesContaining(media)
    if (currentSeries?.id === seriesId) return

    updateItem(getMediaPath(media.type, seriesId), media)
    if (currentSeries) {
      deleteMediaFromSeries(currentSeries, media)
    } else {
      deleteItem(getMediaKey(media.type), media)
    }
  }

  return (
    <MediaStorageContext.Provider value={value}>
      {children}
    </MediaStorageContext.Provider>
  )
}

export function useMediaStorage(): MediaStorageContextType {
  const context = useContext(MediaStorageContext)
  if (!context) {
    throw new Error("missing MediaStorageContext provider")
  }
  return context
}
