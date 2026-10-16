import { getLegacyUpdates, LegacyUpdate, LegacyUpdates } from './legacyUpdates';
import { PrintSeries } from './types';

const compareUpdates = (a: LegacyUpdate, b: LegacyUpdate) =>
  Temporal.Instant.compare(a.at, b.at);

export function findUpToAt(
  series: Pick<PrintSeries, 'upTo'> & LegacyUpdates,
  instant: string,
) {
  const upToUpdates = getLegacyUpdates(series)
    .filter(({ changes }) => 'upTo' in changes)
    .toSorted(compareUpdates);
  const isAfter = ({ at }: LegacyUpdate) =>
    Temporal.Instant.compare(at, instant) > 0;
  const next = upToUpdates.find(isAfter);
  const previous = upToUpdates.findLast((update) => !isAfter(update));
  if (previous) return previous.changes.upTo.to as PrintSeries['upTo'];
  if (next) return next.changes.upTo.from as PrintSeries['upTo'];
  return series.upTo;
}
