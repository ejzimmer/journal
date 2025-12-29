export const KEY = "media/books"

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

export type SeriesDetails = {
  id: string
  type: "series"
  name: string
  books?: Record<string, BookDetails>
}

export type ItemDetails = BookDetails | AuthorDetails | SeriesDetails
