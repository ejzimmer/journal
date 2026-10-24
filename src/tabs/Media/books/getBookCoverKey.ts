import { BookDetails, SeriesDetails } from '../types';

export function getBookCoverKey(
  book: BookDetails,
  series?: SeriesDetails<BookDetails>,
) {
  if (!series) return book.author ?? book.title;

  const seriesAuthor = Object.values(series.items ?? {}).find(
    ({ author }) => author,
  )?.author;
  return seriesAuthor ?? series.id;
}
