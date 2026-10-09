import { getCompletionYear, useCompletionYears } from '../../shared/years';
import {
  isMediaComplete,
  isSeries,
  MediaDetails,
  SeriesDetails,
} from './types';

const listSeriesItems = <T extends MediaDetails>(series: SeriesDetails<T>) =>
  Object.values(series.items ?? {});

const isEntryComplete = <T extends MediaDetails>(
  entry: T | SeriesDetails<T>,
) =>
  isSeries(entry)
    ? listSeriesItems(entry).length > 0 &&
      listSeriesItems(entry).every(isMediaComplete)
    : isMediaComplete(entry);

const getEntryCompletionYear = <T extends MediaDetails>(
  entry: T | SeriesDetails<T>,
) =>
  isSeries(entry)
    ? Math.max(...listSeriesItems(entry).map(getCompletionYear))
    : getCompletionYear(entry);

export function useMediaYears<T extends MediaDetails>(
  entries: (T | SeriesDetails<T>)[],
) {
  const completionYears = useCompletionYears(
    entries,
    isEntryComplete,
    getEntryCompletionYear,
  );
  const entriesInYear = entries.filter(completionYears.isInSelectedYear);

  return {
    ...completionYears,
    seriesInYear: entriesInYear.filter((entry): entry is SeriesDetails<T> =>
      isSeries(entry),
    ),
    singlesInYear: entriesInYear.filter(
      (entry): entry is T => !isSeries(entry),
    ),
  };
}
