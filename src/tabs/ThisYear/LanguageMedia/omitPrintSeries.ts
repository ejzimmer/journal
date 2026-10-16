import { isPrintSeries, StoredMediaByYear } from './types';

export const omitPrintSeries = (
  storedMediaByYear: StoredMediaByYear = {},
): StoredMediaByYear =>
  Object.fromEntries(
    Object.entries(storedMediaByYear).map(([year, mediaById]) => [
      year,
      Object.fromEntries(
        Object.entries(mediaById).filter(([, media]) => !isPrintSeries(media)),
      ),
    ]),
  );
