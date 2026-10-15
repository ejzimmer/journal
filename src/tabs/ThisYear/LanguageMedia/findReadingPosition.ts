import { Reading, Volume } from './types';

const MIN_POSITION = 0.1;

export function findReadingPosition(
  { pages }: Volume,
  { page }: Reading,
  progress: number,
) {
  const position =
    page === undefined || !pages ? progress : Math.min(progress, page / pages);
  return Math.max(MIN_POSITION, position);
}
