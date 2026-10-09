import { getCompletionYear, useItemYears } from '../../shared/years';
import {
  isMediaComplete,
  isSeries,
  MediaDetails,
  SeriesDetails,
} from './types';

const getSeriesItems = <T extends MediaDetails>(series: SeriesDetails<T>) =>
  Object.values(series.items ?? {});

const isEntryComplete = <T extends MediaDetails>(
  entry: T | SeriesDetails<T>,
) =>
  isSeries(entry)
    ? getSeriesItems(entry).length > 0 &&
      getSeriesItems(entry).every(isMediaComplete)
    : isMediaComplete(entry);

const getEntryCompletionYear = <T extends MediaDetails>(
  entry: T | SeriesDetails<T>,
) =>
  isSeries(entry)
    ? Math.max(...getSeriesItems(entry).map(getCompletionYear))
    : getCompletionYear(entry);

export function useMediaYears<T extends MediaDetails>(
  entries: (T | SeriesDetails<T>)[],
) {
  const itemYears = useItemYears(
    entries,
    isEntryComplete,
    getEntryCompletionYear,
  );
  const entriesInYear = entries.filter(itemYears.isInSelectedYear);

  return {
    ...itemYears,
    seriesInYear: entriesInYear.filter((entry): entry is SeriesDetails<T> =>
      isSeries(entry),
    ),
    singlesInYear: entriesInYear.filter(
      (entry): entry is T => !isSeries(entry),
    ),
  };
}
