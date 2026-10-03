import { listByNumber } from './lists';
import { PrintSeries } from './types';

export function findCurrentVolume({ volumes, upTo }: PrintSeries) {
  const ordered = listByNumber(volumes);
  return (
    ordered.find(({ number }) => number === upTo?.volume) ??
    ordered.find(({ status }) => status !== 'done') ??
    ordered.at(-1)
  );
}
