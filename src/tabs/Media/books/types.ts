export const KEY = "media/books"

export type AuthorDetails = {
  id: string
  name: string
  type: "author"
  books?: Record<string, BookDetails>
  series?: Record<string, SeriesDetails>
}

export type BookDetails = {
  id: string
  title: string
  type: "book"
}

export type SeriesDetails = {
  id: string
  name: string
  type: "series"
  books?: Record<string, BookDetails>
}

export type ItemDetails = BookDetails | AuthorDetails | SeriesDetails
