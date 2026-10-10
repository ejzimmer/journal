import { getItemsByNumber } from './lists';
import { ItemUpdate, PrintSeries } from './types';
import { readVolumeProgress } from './volumeProgress';

export type Bloom = {
  key: string;
  limbKey: string;
  at: number;
  understood: number;
};

const MIN_POSITION = 0.1;

const compareUpdates = (a: ItemUpdate, b: ItemUpdate) =>
  Temporal.Instant.compare(a.at, b.at);

function findUpToAt(series: PrintSeries, instant: string) {
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

export function getBlooms(series: PrintSeries): Bloom[] {
  return getItemsByNumber(series.volumes).flatMap((volume) => {
    const progress = readVolumeProgress(series, volume);
    return Object.entries(volume.updates ?? {})
      .filter(([, { changes }]) => changes.understood?.to !== undefined)
      .toSorted(([, a], [, b]) => compareUpdates(a, b))
      .map(([id, update]) => {
        const upTo = findUpToAt(series, update.at);
        const progressThen = readVolumeProgress(
          { ...series, upTo },
          { ...volume, status: undefined },
        );
        return {
          key: id,
          limbKey: `${volume.id}-limb`,
          at: Math.max(MIN_POSITION, Math.min(progress, progressThen)),
          understood: Number(update.changes.understood.to),
        };
      });
  });
}
