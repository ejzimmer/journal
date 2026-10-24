import { BookDetails, SeriesDetails } from '../types';

export function getSeriesBandKey(series: SeriesDetails<BookDetails>) {
  const seriesAuthor = Object.values(series.items ?? {}).find(
    ({ author }) => author,
  )?.author;
  return seriesAuthor ?? series.id;
}
