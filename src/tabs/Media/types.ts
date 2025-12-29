export const BOOKS_KEY = "media/books"
export const GAMES_KEY = "media/games"

export type AuthorDetails = {
  id: string
  type: "author"
  name: string
  books?: Record<string, BookDetails>
  series?: Record<string, SeriesDetails>
}

export type BookDetails = {
  id: string
  type: "book"
  title: string
  medium?: "📖" | "🎧" | null
  isDone?: boolean
}

export type GameDetails = {
  id: string
  type: "game"
  title: string
  isDone?: boolean
}

export type SeriesDetails = {
  id: string
  type: "series"
  name: string
  items?: Record<string, BookDetails | GameDetails>
}

export type ItemDetails = BookDetails | AuthorDetails | SeriesDetails
