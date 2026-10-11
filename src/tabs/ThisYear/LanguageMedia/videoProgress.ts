import { Video } from './types';

export function readVideoProgress({
  status,
  lengthInSeconds,
  upToInSeconds,
}: Video) {
  if (status === 'done') return 1;
  if (!lengthInSeconds || !upToInSeconds) return 0;
  return Math.min(1, upToInSeconds / lengthInSeconds);
}
