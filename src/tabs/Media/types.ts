export const BOOKS_KEY = "media/books"
export const GAMES_KEY = "media/games"

export type SeriesDetails<T extends BookDetails | GameDetails> = {
  id: string
  type: "series"
  name: string
  items?: Record<string, T>
}

export type BookDetails = {
  id: string
  type: "book"
  title: string
  author?: string
  medium?: "📖" | "🎧" | null
  isDone?: boolean
}

export type GameDetails = {
  id: string
  type: "game"
  title: string
  status?: null | "in_progress" | "done"
}

export type ReadingItemDetails = BookDetails | SeriesDetails<BookDetails>

export type PlayingItemDetails = GameDetails | SeriesDetails<GameDetails>

export const isSeries = (
  item: ReadingItemDetails | PlayingItemDetails
): item is SeriesDetails<any> => item.type === "series"
