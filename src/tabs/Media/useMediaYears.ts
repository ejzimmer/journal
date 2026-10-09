import { useCompletionYears } from '../../shared/years';
import {
  isMediaComplete,
  isSeries,
  MediaDetails,
  SeriesDetails,
} from './types';

export type SeriesInYear<T extends MediaDetails> = {
  series: SeriesDetails<T>;
  items: Record<string, T>;
};

export function useMediaYears<T extends MediaDetails>(
  entries: (T | SeriesDetails<T>)[],
) {
  const allSeries = entries.filter((entry): entry is SeriesDetails<T> =>
    isSeries(entry),
  );
  const singles = entries.filter((entry): entry is T => !isSeries(entry));
  const allMedia = [
    ...singles,
    ...allSeries.flatMap((series) => Object.values(series.items ?? {})),
  ];

  const completionYears = useCompletionYears(allMedia, isMediaComplete);
  const { isInSelectedYear } = completionYears;

  const seriesInYear = allSeries
    .map((series) => ({
      series,
      items: Object.fromEntries(
        Object.entries(series.items ?? {}).filter(([, item]) =>
          isInSelectedYear(item),
        ),
      ),
    }))
    .filter(({ items }) => Object.keys(items).length > 0);

  return {
    ...completionYears,
    seriesInYear,
    singlesInYear: singles.filter(isInSelectedYear),
  };
}
