import { ItemUpdate, PrintSeries } from './types';

const compareUpdates = (a: ItemUpdate, b: ItemUpdate) =>
  Temporal.Instant.compare(a.at, b.at);

export function findUpToAt(series: PrintSeries, instant: string) {
  const upToUpdates = Object.values(series.updates ?? {})
    .filter(({ changes }) => 'upTo' in changes)
    .toSorted(compareUpdates);
  const isAfter = ({ at }: ItemUpdate) =>
    Temporal.Instant.compare(at, instant) > 0;
  const next = upToUpdates.find(isAfter);
  const previous = upToUpdates.findLast((update) => !isAfter(update));
  if (previous) return previous.changes.upTo.to as PrintSeries['upTo'];
  if (next) return next.changes.upTo.from as PrintSeries['upTo'];
  return series.upTo;
}
