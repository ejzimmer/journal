export const BOOKS_KEY = "media/books"
export const GAMES_KEY = "media/games"

export type SeriesDetails<T extends BookDetails | GameDetails> = {
  id: string
  type: "series"
  name: string
  items?: Record<string, T>
}

export const BOOK_STATUS_ORDER = ["unread", "reading", "listening", "read"] as const
export type BookStatus = (typeof BOOK_STATUS_ORDER)[number]

export const GAME_STATUS_ORDER = ["unplayed", "playing", "played"] as const
export type GameStatus = (typeof GAME_STATUS_ORDER)[number]

export type BookDetails = {
  id: string
  type: "book"
  title: string
  author?: string
  status?: BookStatus
}

export type GameDetails = {
  id: string
  type: "game"
  title: string
  status?: GameStatus
}

export function getBookStatus(book: BookDetails): BookStatus {
  return book.status ?? "unread"
}

export function getGameStatus(game: GameDetails): GameStatus {
  return game.status ?? "unplayed"
}

export type NewBook = Omit<BookDetails, "id">
export type NewGame = Omit<GameDetails, "id">

export type MediaDetails = BookDetails | GameDetails
export type NewMedia = NewBook | NewGame
export type MediaSeries =
  | SeriesDetails<BookDetails>
  | SeriesDetails<GameDetails>

export type ReadingItemDetails = BookDetails | SeriesDetails<BookDetails>

export type PlayingItemDetails = GameDetails | SeriesDetails<GameDetails>

export const isSeries = <T extends BookDetails | GameDetails>(
  item: T | SeriesDetails<T>
): item is SeriesDetails<T> => item.type === "series"
