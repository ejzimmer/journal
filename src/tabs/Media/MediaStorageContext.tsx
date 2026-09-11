import { createContext, ReactNode, useContext, useMemo } from "react"
import { ContextType, useStorageContext } from "../../shared/FirebaseContext"
import {
  BookDetails,
  BOOKS_KEY,
  GameDetails,
  GAMES_KEY,
  isSeries,
  NewBook,
  NewGame,
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

  addBook: (book: NewBook) => void
  addGame: (game: NewGame) => void

  addBookSeries: (name: string, book: NewBook) => void
  addGameSeries: (name: string, game: NewGame) => void

  addBookToSeries: (seriesId: string, book: NewBook) => void
  addGameToSeries: (seriesId: string, game: NewGame) => void

  deleteBook: (book: BookDetails) => void
  deleteGame: (game: GameDetails) => void

  moveBookToSeries: (book: BookDetails, seriesId: string) => void
  moveGameToSeries: (game: GameDetails, seriesId: string) => void

  moveBookToMainList: (book: BookDetails) => void
  moveGameToMainList: (game: GameDetails) => void
}

function createMediaOperations<T extends BookDetails | GameDetails>({
  key,
  type,
  entries,
  storage,
}: {
  key: string
  type: T["type"]
  entries: (T | SeriesDetails<T>)[]
  storage: ContextType
}) {
  const findSeriesContaining = (itemId: string) =>
    entries
      .filter((entry) => isSeries(entry))
      .find((series) => itemId in (series.items ?? {}))

  const deleteItemFromSeries = (series: SeriesDetails<T>, item: T) => {
    const isLastInSeries = Object.keys(series.items ?? {}).length <= 1
    if (isLastInSeries) {
      storage.deleteItem(key, series)
    } else {
      storage.deleteItem(`${key}/${series.id}/items`, item)
    }
  }

  return {
    addItem: (item: Omit<T, "id" | "type">) =>
      storage.addItem(key, { ...item, type }),
    addSeries: (name: string, item: Omit<T, "id" | "type">) => {
      const seriesId = storage.addItem<SeriesDetails<T>>(key, {
        type: "series",
        name,
      })
      storage.addItem(`${key}/${seriesId}/items`, { ...item, type })
    },
    addItemToSeries: (seriesId: string, item: Omit<T, "id" | "type">) =>
      storage.addItem(`${key}/${seriesId}/items`, { ...item, type }),
    deleteItem: (item: T) => {
      const series = findSeriesContaining(item.id)
      if (series) {
        deleteItemFromSeries(series, item)
      } else {
        storage.deleteItem(key, item)
      }
    },
    moveItemToSeries: (item: T, seriesId: string) => {
      const currentSeries = findSeriesContaining(item.id)
      if (currentSeries?.id === seriesId) return

      storage.updateItem(`${key}/${seriesId}/items`, item)
      if (currentSeries) {
        deleteItemFromSeries(currentSeries, item)
      } else {
        storage.deleteItem(key, item)
      }
    },
    moveItemToMainList: (item: T) => {
      const currentSeries = findSeriesContaining(item.id)
      if (!currentSeries) return

      storage.updateItem(key, item)
      deleteItemFromSeries(currentSeries, item)
    },
  }
}

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
  const storage = useStorageContext()
  const { useValue } = storage

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

  const bookOperations = createMediaOperations<BookDetails>({
    key: BOOKS_KEY,
    type: "book",
    entries: books,
    storage,
  })
  const gameOperations = createMediaOperations<GameDetails>({
    key: GAMES_KEY,
    type: "game",
    entries: games,
    storage,
  })

  const value: MediaStorageContextType = {
    books,
    games,
    bookSeries,
    gameSeries,
    authors,
    isLoading: booksLoading || gamesLoading,

    addBook: bookOperations.addItem,
    addGame: gameOperations.addItem,

    addBookSeries: bookOperations.addSeries,
    addGameSeries: gameOperations.addSeries,

    addBookToSeries: bookOperations.addItemToSeries,
    addGameToSeries: gameOperations.addItemToSeries,

    deleteBook: bookOperations.deleteItem,
    deleteGame: gameOperations.deleteItem,

    moveBookToSeries: bookOperations.moveItemToSeries,
    moveGameToSeries: gameOperations.moveItemToSeries,

    moveBookToMainList: bookOperations.moveItemToMainList,
    moveGameToMainList: gameOperations.moveItemToMainList,
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
